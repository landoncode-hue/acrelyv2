import sql from '@/lib/db';
import { logger } from '@/lib/logger';
import { AllocationRepository } from '../repositories/AllocationRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { getPresignedDownloadUrl, uploadFileBuffer } from '@/lib/storage';
import { jsPDF } from 'jspdf';
export interface RecordPaymentParams {
    allocationId: string;
    customerId: string | null;
    amount: number;
    date: string;
    reference?: string;
    method: string;
}

export class PaymentService {
    private allocationRepository: AllocationRepository;
    private paymentRepository: PaymentRepository;

    constructor() {
        this.allocationRepository = new AllocationRepository();
        this.paymentRepository = new PaymentRepository();
    }

    async getAllPayments() {
        return this.paymentRepository.findAll();
    }

    async getPaymentById(id: string) {
        return this.paymentRepository.findById(id);
    }

    async getPaymentsByCustomerId(customerId: string) {
        return this.paymentRepository.findByCustomerId(customerId);
    }

    async recordPayment(params: RecordPaymentParams, actorId: string): Promise<{ payment: { id: string;[key: string]: any }; remaining_balance: number; installments_updated: number }> {
        return await sql.begin(async (tx) => {
            // Find payment plan
            const plans = await tx`SELECT id FROM payment_plans WHERE allocation_id = ${params.allocationId} LIMIT 1`;
            if (plans.length === 0) throw new Error("No payment plan found for this allocation");
            const planId = plans[0].id;

            // Fetch unpaid installments
            const installments = await tx`
                SELECT id, amount_due, amount_paid, status 
                FROM payment_plan_installments 
                WHERE payment_plan_id = ${planId} AND status IN ('pending', 'overdue')
                ORDER BY due_date ASC, installment_number ASC
            `;

            let remainingAmount = params.amount;
            let installmentsUpdated = 0;

            for (const inst of installments) {
                if (remainingAmount <= 0) break;

                const amountLeft = Number(inst.amount_due) - Number(inst.amount_paid || 0);
                if (amountLeft <= 0) continue;

                const amountToApply = Math.min(remainingAmount, amountLeft);
                const newPaid = Number(inst.amount_paid || 0) + amountToApply;
                const newStatus = newPaid >= Number(inst.amount_due) ? 'paid' : inst.status;

                await tx`
                    UPDATE payment_plan_installments 
                    SET amount_paid = ${newPaid}, status = ${newStatus}, updated_at = NOW()
                    WHERE id = ${inst.id}
                `;

                remainingAmount -= amountToApply;
                installmentsUpdated++;
            }

            // Create payment record
            const [payment] = await tx`
                INSERT INTO payments (
                    allocation_id, customer_id, amount, payment_date, reference, method, status, recorded_by, created_at
                ) VALUES (
                    ${params.allocationId}, ${params.customerId}, ${params.amount}, ${params.date}, ${params.reference || null}, ${params.method}, 'verified', ${actorId}, NOW()
                )
                RETURNING *
            `;

            return {
                payment,
                remaining_balance: remainingAmount,
                installments_updated: installmentsUpdated
            };
        });
    }

    async reversePayment(params: {
        paymentId: string;
        reversalReason: string;
        actorUserId: string;
        actorRole: string;
    }) {
        return await sql.begin(async (tx) => {
            const payments = await tx`SELECT * FROM payments WHERE id = ${params.paymentId} LIMIT 1`;
            if (payments.length === 0) throw new Error("Payment not found");
            const payment = payments[0];

            if (payment.status === 'reversed') throw new Error("Payment is already reversed");

            await tx`
                UPDATE payments 
                SET status = 'reversed', 
                    updated_at = NOW()
                WHERE id = ${params.paymentId}
            `;

            await tx`
                INSERT INTO audit_logs (actor_user_id, actor_role, action_type, target_id, target_type, changes)
                VALUES (${params.actorUserId}, ${params.actorRole}, 'record_payment', ${params.paymentId}, 'payments', ${sql.json({ reason: params.reversalReason, action: 'reverse' })})
            `;

            const plans = await tx`SELECT id FROM payment_plans WHERE allocation_id = ${payment.allocation_id} LIMIT 1`;
            if (plans.length > 0) {
                const planId = plans[0].id;

                const installments = await tx`
                    SELECT id, amount_due, amount_paid, status, due_date 
                    FROM payment_plan_installments 
                    WHERE payment_plan_id = ${planId} AND amount_paid > 0
                    ORDER BY installment_number DESC
                `;

                let amountToReverse = Number(payment.amount);

                for (const inst of installments) {
                    if (amountToReverse <= 0) break;

                    const paid = Number(inst.amount_paid);
                    const amountToDeduct = Math.min(amountToReverse, paid);

                    const newPaid = paid - amountToDeduct;
                    const isOverdue = new Date(inst.due_date) < new Date();
                    const newStatus = newPaid === 0
                        ? (isOverdue ? 'overdue' : 'pending')
                        : (newPaid < Number(inst.amount_due) ? (isOverdue ? 'overdue' : 'pending') : inst.status);

                    await tx`
                        UPDATE payment_plan_installments 
                        SET amount_paid = ${newPaid}, status = ${newStatus}, updated_at = NOW()
                        WHERE id = ${inst.id}
                    `;

                    amountToReverse -= amountToDeduct;
                }
            }

            return { success: true };
        });
    }

    async generateReceipt(params: {
        paymentId: string;
        actorUserId: string;
        actorRole: string;
        regenerate?: boolean;
    }) {
        try {
            const payments = await sql`
                SELECT p.*, c.full_name as customer_name 
                FROM payments p
                LEFT JOIN customers c ON p.customer_id = c.id
                WHERE p.id = ${params.paymentId} LIMIT 1
            `;
            if (payments.length === 0) throw new Error("Payment not found");
            const payment = payments[0];

            // Generate simple PDF receipt
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.text("Acrely Payment Receipt", 20, 20);

            doc.setFontSize(12);
            doc.text(`Receipt ID: ${payment.id}`, 20, 40);
            doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 20, 50);
            doc.text(`Customer: ${payment.customer_name || 'N/A'}`, 20, 60);
            doc.text(`Amount: NGN ${Number(payment.amount).toLocaleString()}`, 20, 70);
            doc.text(`Method: ${payment.method}`, 20, 80);
            doc.text(`Reference: ${payment.reference || 'N/A'}`, 20, 90);
            doc.text(`Status: ${payment.status}`, 20, 100);

            doc.text("Thank you for your business!", 20, 120);

            const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
            const objectName = `${payment.id}.pdf`;

            await uploadFileBuffer("receipts", objectName, pdfBuffer, "application/pdf");

            return { success: true, path: objectName };
        } catch (error) {
            logger.error('PaymentService.generateReceipt error', error);
            throw error;
        }
    }

    async getSignedReceiptUrl(path: string) {
        if (!path) throw new Error("Path required to get receipt URL");
        try {
            return await getPresignedDownloadUrl("receipts", path);
        } catch (error) {
            logger.error('PaymentService.getSignedReceiptUrl error', error);
            throw new Error("Failed to generate receipt download link");
        }
    }
}
