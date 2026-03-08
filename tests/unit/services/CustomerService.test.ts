import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerService } from '@/lib/services/CustomerService';

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('CustomerService', () => {
    let mockSupabase: any;
    let service: CustomerService;

    const createMockChain = () => {
        const chain: any = {
            from: vi.fn(),
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            eq: vi.fn(),
            or: vi.fn(),
            single: vi.fn(),
            maybeSingle: vi.fn(),
            rpc: vi.fn(),
            then: vi.fn(),
            functions: {
                invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
            }
        };

        chain.from.mockReturnValue(chain);
        chain.select.mockReturnValue(chain);
        chain.insert.mockReturnValue(chain);
        chain.update.mockReturnValue(chain);
        chain.delete.mockReturnValue(chain);
        chain.eq.mockReturnValue(chain);
        chain.or.mockReturnValue(chain);
        chain.single.mockResolvedValue({ data: null, error: null });
        chain.maybeSingle.mockResolvedValue({ data: null, error: null });
        chain.rpc.mockReturnValue(chain);

        chain.then.mockImplementation((onFulfilled: any) => {
            return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        });

        return chain;
    };

    beforeEach(() => {
        mockSupabase = createMockChain();
        service = new CustomerService();
    });

    describe('createCustomer', () => {
        const customerData = {
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '123456789'
        };

        it('should create a new customer', async () => {
            vi.spyOn(service, 'checkConflict').mockResolvedValue(null);
            mockSupabase.single.mockResolvedValueOnce({ data: { id: 'cust-1', ...customerData }, error: null });

            const result = await service.createCustomer(customerData, 'actor-1');

            expect(result.id).toBe('cust-1');
            expect(mockSupabase.from).toHaveBeenCalledWith('customers');
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                full_name: 'John Doe',
                created_by: 'actor-1'
            }));
        });
    });

    describe('verifyKyc', () => {
        const customerId = 'cust-1';

        it('should update status to verified and log audit', async () => {
            mockSupabase.single.mockResolvedValueOnce({ data: { id: customerId }, error: null }); // update result

            await service.verifyKyc(customerId, 'verify', 'actor-1');

            expect(mockSupabase.from).toHaveBeenCalledWith('customers');
            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
                kyc_status: 'verified'
            }));
            expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                action_type: 'kyc.verify'
            }));
        });

        it('should update status to rejected when action is reject', async () => {
            mockSupabase.single.mockResolvedValueOnce({ data: { id: customerId }, error: null });

            await service.verifyKyc(customerId, 'reject', 'actor-1', 'Invalid document');

            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
                kyc_status: 'rejected'
            }));
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                action_type: 'kyc.reject',
                changes: expect.objectContaining({ reason: 'Invalid document' })
            }));
        });
    });
});
