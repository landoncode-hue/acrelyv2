import { IRepository } from './IRepository';
import { Payment, PaymentPlan, Installment } from '../types';

export interface IPaymentRepository extends IRepository<Payment> {
    findPaymentPlanByAllocationId(allocationId: string): Promise<PaymentPlan | null>;

    // Finds the next unpaid installment for an allocation using RPC logic if necessary, or DB query
    findNextUnpaidInstallment(allocationId: string): Promise<{ installment_id: string } | null>;

    findInstallments(paymentPlanId: string, status?: string[]): Promise<Installment[]>;

    updateInstallment(id: string, updates: Partial<Installment>): Promise<void>;

    // Create payment is covered by BaseRepository.create, but specialized return might be needed?
    // BaseRepository already returns T, which is Payment. So create is fine.
}
