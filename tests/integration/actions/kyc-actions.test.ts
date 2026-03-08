import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitKycDataAction, verifyKycAction } from '@/lib/actions/kyc-actions';
import { revalidatePath } from 'next/cache';
import { CustomerService } from '@/lib/services/CustomerService';
import { getCurrentUser } from '@/lib/auth/session';
import { ProfileService } from '@/lib/services/ProfileService';

// Mock modules
vi.mock('@/lib/auth/session');
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/services/CustomerService');
vi.mock('@/lib/services/ProfileService');

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('kyc-actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('submitKycData', () => {
        const kycData = {
            id_type: 'passport',
            id_number: 'P123',
            id_url: 'http://example.com/id.jpg',
            selfie_url: 'http://example.com/selfie.jpg'
        };

        it('should submit kyc data successfully', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'user-1', role: 'customer' });
            vi.spyOn(CustomerService.prototype, 'getCustomerByProfileId').mockResolvedValue({ id: 'cust-1' } as any);

            const spy = vi.spyOn(CustomerService.prototype, 'submitKycData').mockResolvedValue({ success: true } as any);

            const result = await (submitKycDataAction as any)(kycData);

            expect(result.success).toBe(true);
            expect(spy).toHaveBeenCalledWith('cust-1', kycData);
        });

        it('should return error if customer record not found', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'user-1', role: 'customer' });
            vi.spyOn(CustomerService.prototype, 'getCustomerByProfileId').mockResolvedValue(null);

            const result = await (submitKycDataAction as any)(kycData);


            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('Customer record not found');
        });


    });

    describe('verifyKyc', () => {
        it('should verify kyc and revalidate paths', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'admin-1', role: 'sysadmin' });
            const spy = vi.spyOn(CustomerService.prototype, 'verifyKyc').mockResolvedValue({ success: true } as any);

            const result = await (verifyKycAction as any)('cust-1', 'verify');

            expect(result.success).toBe(true);
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customers/kyc');
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customers/cust-1');
        });

        it('should handle rejection with reason', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'admin-1', role: 'sysadmin' });
            const spy = vi.spyOn(CustomerService.prototype, 'verifyKyc').mockResolvedValue({ success: true } as any);

            const result = await (verifyKycAction as any)('cust-1', 'reject', 'Blurry photo');

            expect(result.success).toBe(true);
            expect(spy).toHaveBeenCalledWith('cust-1', 'reject', 'admin-1', 'Blurry photo');
        });
    });
});

