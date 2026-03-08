import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class DeleteService {
    constructor() { }

    /**
     * Atomically deletes a customer and all related data (receipts, payments, allocations, etc.)
     * Uses the `delete_customer_cascade` RPC function for transaction safety.
     */
    async deleteCustomer(customerId: string): Promise<boolean> {
        logger.info('DeleteService.deleteCustomer: Starting', { customerId });

        try {
            await sql`SELECT delete_customer_cascade(${customerId})`;
            logger.info('DeleteService.deleteCustomer: Success', { customerId });
            return true;
        } catch (error) {
            logger.error('DeleteService.deleteCustomer error', error);
            throw error;
        }
    }

    /**
     * Atomically deletes an allocation and all related data.
     * Uses the `delete_allocation_cascade` RPC function for transaction safety.
     */
    async deleteAllocation(allocationId: string): Promise<boolean> {
        logger.info('DeleteService.deleteAllocation: Starting', { allocationId });

        try {
            await sql`SELECT delete_allocation_cascade(${allocationId})`;
            logger.info('DeleteService.deleteAllocation: Success', { allocationId });
            return true;
        } catch (error) {
            logger.error('DeleteService.deleteAllocation error', error);
            throw error;
        }
    }

    /**
     * Deletes a payment.
     */
    async deletePayment(paymentId: string): Promise<boolean> {
        logger.info('DeleteService.deletePayment: Starting', { paymentId });

        try {
            await sql`DELETE FROM payments WHERE id = ${paymentId}`;
            logger.info('DeleteService.deletePayment: Success', { paymentId });
            return true;
        } catch (error) {
            logger.error('DeleteService.deletePayment error', error);
            throw error;
        }
    }

    /**
     * Deletes a lead.
     */
    async deleteLead(leadId: string): Promise<boolean> {
        logger.info('DeleteService.deleteLead: Starting', { leadId });

        try {
            await sql`DELETE FROM leads WHERE id = ${leadId}`;
            logger.info('DeleteService.deleteLead: Success', { leadId });
            return true;
        } catch (error) {
            logger.error('DeleteService.deleteLead error', error);
            throw error;
        }
    }
}
