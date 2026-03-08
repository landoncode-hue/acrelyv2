import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export type CreatePaymentPlanParams = {
    name: string;
    duration_months: number;
    interest_rate: number;
    initial_deposit_percent: number;
    description?: string;
};

export class PaymentPlanService {
    constructor() { }

    async getPaymentPlans() {
        try {
            const data = await sql`
                SELECT * FROM payment_plans ORDER BY created_at DESC
            `;
            return data;
        } catch (error) {
            logger.error('PaymentPlanService.getPaymentPlans error', error);
            throw error;
        }
    }

    async createPaymentPlan(params: CreatePaymentPlanParams, createdBy: string) {
        try {
            const [data] = await sql`
                INSERT INTO payment_plans (
                    name,
                    duration_months,
                    interest_rate,
                    initial_deposit_percent,
                    description,
                    created_by,
                    is_active
                ) VALUES (
                    ${params.name},
                    ${params.duration_months},
                    ${params.interest_rate},
                    ${params.initial_deposit_percent},
                    ${params.description || null},
                    ${createdBy},
                    true
                )
                RETURNING *
            `;
            return data;
        } catch (error) {
            logger.error('PaymentPlanService.createPaymentPlan error', error);
            throw error;
        }
    }

    async updatePaymentPlan(id: string, updates: Partial<CreatePaymentPlanParams> & { is_active?: boolean }) {
        try {
            await sql`
                UPDATE payment_plans 
                SET ${sql(updates)}
                WHERE id = ${id}
            `;
            return true;
        } catch (error) {
            logger.error('PaymentPlanService.updatePaymentPlan error', error);
            throw error;
        }
    }

    async deletePaymentPlan(id: string) {
        try {
            await sql`DELETE FROM payment_plans WHERE id = ${id}`;
            return true;
        } catch (error) {
            logger.error('PaymentPlanService.deletePaymentPlan error', error);
            throw error;
        }
    }
}
