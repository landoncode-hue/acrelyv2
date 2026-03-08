import sql from '@/lib/db';
import { BaseRepository } from './BaseRepository';
import { IPaymentRepository } from './interfaces/IPaymentRepository';
import { Payment, PaymentPlan, Installment } from './types';
import { logger } from '@/lib/logger';

export class PaymentRepository extends BaseRepository<Payment> implements IPaymentRepository {
    constructor() {
        super('payments');
    }

    async findPaymentPlanByAllocationId(allocationId: string): Promise<PaymentPlan | null> {
        try {
            const [data] = await sql<PaymentPlan[]>`
                SELECT * FROM payment_plans
                WHERE allocation_id = ${allocationId}
            `;
            return data || null;
        } catch (error) {
            logger.error('PaymentRepository.findPaymentPlanByAllocationId error', error);
            throw error;
        }
    }

    async findNextUnpaidInstallment(allocationId: string): Promise<{ installment_id: string } | null> {
        try {
            const [data] = await sql<any[]>`
                SELECT installment_id FROM get_next_unpaid_installment(${allocationId})
                LIMIT 1
            `;
            return data || null;
        } catch (error) {
            logger.error('PaymentRepository.findNextUnpaidInstallment error', error);
            throw error;
        }
    }

    async findInstallments(paymentPlanId: string, status?: string[]): Promise<Installment[]> {
        try {
            let query = sql`
                SELECT * FROM payment_plan_installments
                WHERE payment_plan_id = ${paymentPlanId}
            `;

            if (status && status.length > 0) {
                query = sql`${query} AND status IN (${sql(status)})`;
            }

            query = sql`${query} ORDER BY due_date ASC, installment_number ASC`;

            const data = await query;
            return data as unknown as Installment[];
        } catch (error) {
            logger.error('PaymentRepository.findInstallments error', error);
            throw error;
        }
    }

    async updateInstallment(id: string, updates: Partial<Installment>): Promise<void> {
        try {
            await sql`
                UPDATE payment_plan_installments
                SET ${sql({ ...updates, updated_at: new Date() } as any)}
                WHERE id = ${id}
            `;
        } catch (error) {
            logger.error('PaymentRepository.updateInstallment error', error);
            throw error;
        }
    }

    async findAll() {
        try {
            return await sql<any[]>`
                SELECT 
                    p.*,
                    c.full_name as customer_name,
                    c.email as customer_email,
                    ct.full_name as customer_full_name,
                    a.id as allocation_id,
                    e.name as estate_name,
                    pl.plot_number
                FROM payments p
                LEFT JOIN customers ct ON p.customer_id = ct.id
                LEFT JOIN allocations a ON p.allocation_id = a.id
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN estates e ON a.estate_id = e.id
                LEFT JOIN plots pl ON a.plot_id = pl.id
                ORDER BY p.created_at DESC
            `;
        } catch (error) {
            logger.error('PaymentRepository.findAll error', error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const [data] = await sql<any[]>`
                SELECT 
                    p.*,
                    c.full_name as customer_name,
                    c.email as customer_email,
                    e.name as estate_name,
                    pl.plot_number
                FROM payments p
                LEFT JOIN allocations a ON p.allocation_id = a.id
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN estates e ON a.estate_id = e.id
                LEFT JOIN plots pl ON a.plot_id = pl.id
                WHERE p.id = ${id}
            `;
            return data || null;
        } catch (error) {
            logger.error('PaymentRepository.findById error', error);
            throw error;
        }
    }

    async findByCustomerId(customerId: string) {
        try {
            return await sql<any[]>`
                SELECT 
                    p.*,
                    c.full_name as customer_name,
                    c.email as customer_email,
                    ct.full_name as customer_full_name,
                    a.id as allocation_id,
                    e.name as estate_name,
                    pl.plot_number
                FROM payments p
                LEFT JOIN customers ct ON p.customer_id = ct.id
                LEFT JOIN allocations a ON p.allocation_id = a.id
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN estates e ON a.estate_id = e.id
                LEFT JOIN plots pl ON a.plot_id = pl.id
                WHERE p.customer_id = ${customerId} OR a.customer_id = ${customerId}
                ORDER BY p.created_at DESC
            `;
        } catch (error) {
            logger.error('PaymentRepository.findByCustomerId error', error);
            throw error;
        }
    }
}
