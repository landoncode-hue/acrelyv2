import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordPaymentAction } from '@/lib/actions/payment-actions';
import { revalidatePath } from 'next/cache';
import { PaymentService } from '@/lib/services/PaymentService';
import { getCurrentUser } from '@/lib/auth/session';

// Mock modules
vi.mock('@/lib/auth/session');
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/services/PaymentService');

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('payment-actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('recordPaymentAction', () => {
        const params = {
            allocationId: 'alloc-123',
            customerId: 'cust-123',
            amount: 1000,
            method: 'cash' as const,
            date: '2023-10-01',
        };

        it('should record a payment successfully', async () => {
            // Mock auth
            (getCurrentUser as any).mockResolvedValue({ id: 'user-123', role: 'sysadmin' });

            // Mock service result on the prototype
            const spy = vi.spyOn(PaymentService.prototype, 'recordPayment').mockResolvedValue({
                payment: { id: 'pay-123' },
                remaining_balance: 0,
                installments_updated: 0
            });

            const result = await (recordPaymentAction as any)(params);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                payment: expect.objectContaining({ id: 'pay-123' }),
                remaining_balance: 0,
                installments_updated: 0
            });
            expect(spy).toHaveBeenCalledWith(params, 'user-123');
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
        });

        it('should return error if unauthorized', async () => {
            // Auth error should trigger catch in action
            (getCurrentUser as any).mockResolvedValue(null);

            const result = await (recordPaymentAction as any)(params);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Unauthorized');
        });

        it('should return error if service fails', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'user-123', role: 'sysadmin' });
            // Mock service failure
            const spy = vi.spyOn(PaymentService.prototype, 'recordPayment').mockRejectedValue(new Error('Database error'));

            const result = await (recordPaymentAction as any)(params);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
        });

    });
});

