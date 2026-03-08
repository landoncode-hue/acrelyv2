import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCustomerAction, convertLeadAction, updateCustomerKYCAction } from '@/lib/actions/customer-actions';
import { revalidatePath } from 'next/cache';
import { CustomerService } from '@/lib/services/CustomerService';
import { ProfileService } from '@/lib/services/ProfileService';
import { getCurrentUser } from '@/lib/auth/session';

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

describe('customer-actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createCustomerAction', () => {
        const input = {
            full_name: 'Jane Doe',
            phone: '08123456789',
            email: 'jane@example.com',
            joined_at: new Date().toISOString()
        };

        it('should create customer successfully', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'user-1', role: 'agent' });
            const spy = vi.spyOn(CustomerService.prototype, 'createCustomer').mockResolvedValue({ success: true, customer: { id: 'cust-1' } } as any);

            const result = await (createCustomerAction as any)(input);

            expect(result.success).toBe(true);
            expect(spy).toHaveBeenCalledWith(input, 'user-1');
        });

        it('should return error if unauthorized', async () => {
            (getCurrentUser as any).mockResolvedValue(null);

            const result = await (createCustomerAction as any)(input);

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('Unauthorized');

        });

    });

    describe('convertLeadAction', () => {
        const input = {
            leadId: 'lead-1',
            email: 'jane@example.com',
        };

        it('should convert lead successfully', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'user-1', role: 'agent' });
            vi.spyOn(ProfileService.prototype, 'getProfile').mockResolvedValue({ id: 'user-1', role: 'agent' } as any);
            const spy = vi.spyOn(CustomerService.prototype, 'convertLead').mockResolvedValue({ success: true, customerId: 'cust-1' } as any);

            const result = await (convertLeadAction as any)(input);

            expect(result.success).toBe(true);
            expect(spy).toHaveBeenCalledWith('lead-1', 'user-1', 'agent', input);
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/leads');
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customers');
        });
    });

    describe('updateCustomerKYCAction', () => {
        it('should update KYC status successfully', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'admin-1', role: 'sysadmin' });
            vi.spyOn(ProfileService.prototype, 'getProfile').mockResolvedValue({ id: 'admin-1', role: 'sysadmin' } as any);
            const spy = vi.spyOn(CustomerService.prototype, 'updateKYCStatus').mockResolvedValue({ success: true } as any);

            const result = await (updateCustomerKYCAction as any)({ customerId: 'cust-1', status: 'verified', notes: 'All good' });

            expect(result.success).toBe(true);
            expect(spy).toHaveBeenCalledWith('cust-1', 'verified', 'All good', 'admin-1', 'sysadmin');
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard/customers/cust-1');
        });

    });
});

