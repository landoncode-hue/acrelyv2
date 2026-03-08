import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService, RecordPaymentParams } from '@/lib/services/PaymentService';

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn((msg, data) => console.error('ERROR:', msg, data)),
    },
}));

describe('PaymentService', () => {
    let mockSupabase: any;
    let service: PaymentService;

    const createMockChain = () => {
        const chain: any = {
            from: vi.fn(),
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            eq: vi.fn(),
            in: vi.fn(),
            order: vi.fn(),
            single: vi.fn(),
            maybeSingle: vi.fn(),
            rpc: vi.fn(),
            functions: {
                invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
            },
            data: null,
            error: null
        };

        chain.from.mockReturnValue(chain);
        chain.select.mockReturnValue(chain);
        chain.insert.mockReturnValue(chain);
        chain.update.mockReturnValue(chain);
        chain.delete.mockReturnValue(chain);
        chain.eq.mockReturnValue(chain);
        chain.in.mockReturnValue(chain);
        chain.order.mockReturnValue(chain);
        chain.rpc.mockReturnValue(chain);

        // Mock terminal methods to return data set on the chain
        chain.single.mockImplementation(async () => ({ data: chain.data, error: chain.error }));
        chain.maybeSingle.mockImplementation(async () => ({ data: chain.data, error: chain.error }));

        // Handle thenable for await on the chain itself (e.g. await query)
        chain.then = (resolve: any) => resolve({ data: chain.data, error: chain.error });

        return chain;
    };

    beforeEach(() => {
        mockSupabase = createMockChain();
        service = new PaymentService();
    });

    describe('recordPayment', () => {
        const params: RecordPaymentParams = {
            allocationId: 'alloc-123',
            customerId: 'cust-456',
            amount: 1000000,
            date: new Date().toISOString(),
            method: 'bank_transfer',
            reference: 'TXN-789'
        };

        it('should record a basic payment and update allocation balance', async () => {
            const allocationData = { id: 'alloc-123', customer_id: 'cust-456', amount_paid: 1000000, total_price: 5000000, status: 'approved' };
            const transactionResult = { payment_id: 'pay-1', new_balance: 3000000 };
            const createdPayment = { id: 'pay-1', amount: 1000000 };

            mockSupabase.from.mockImplementation((table: string) => {
                const chain = createMockChain();
                if (table === 'allocations') {
                    chain.single.mockResolvedValue({ data: allocationData, error: null });
                } else if (table === 'payments') {
                    chain.single.mockResolvedValue({ data: createdPayment, error: null });
                }
                return chain;
            });

            mockSupabase.rpc.mockImplementation((fn: string) => {
                const chain = createMockChain();
                if (fn === 'record_payment_transaction') {
                    chain.then = (resolve: any) => resolve({ data: transactionResult, error: null });
                }
                return chain;
            });

            const result = await service.recordPayment(params, 'actor-1');

            expect(result.payment.id).toBe('pay-1');
            expect(result.remaining_balance).toBe(3000000);
            expect(mockSupabase.rpc).toHaveBeenCalledWith('record_payment_transaction', expect.any(Object));
        });

        it('should handle overpayment gracefully', async () => {
            const allocationData = { id: 'alloc-123', customer_id: 'cust-456', total_price: 500000, status: 'approved' };
            const transactionResult = { payment_id: 'pay-over', new_balance: 0 };
            const createdPayment = { id: 'pay-over', amount: 1000000 };

            mockSupabase.from.mockImplementation((table: string) => {
                const chain = createMockChain();
                if (table === 'allocations') {
                    chain.single.mockResolvedValue({ data: allocationData, error: null });
                } else if (table === 'payments') {
                    chain.single.mockResolvedValue({ data: createdPayment, error: null });
                }
                return chain;
            });

            mockSupabase.rpc.mockImplementation((fn: string) => {
                const chain = createMockChain();
                if (fn === 'record_payment_transaction') {
                    chain.then = (resolve: any) => resolve({ data: transactionResult, error: null });
                }
                return chain;
            });

            const result = await service.recordPayment(params, 'actor-1');

            expect(result.remaining_balance).toBe(0);
        });

        it('should invoke complete-allocation when fully paid', async () => {
            const allocationData = { id: 'alloc-123', status: 'approved' };
            const transactionResult = { payment_id: 'pay-full', new_balance: 0 };
            const createdPayment = { id: 'pay-full', amount: 1000000 };

            mockSupabase.from.mockImplementation((table: string) => {
                const chain = createMockChain();
                if (table === 'allocations') {
                    chain.single.mockResolvedValue({ data: allocationData, error: null });
                } else if (table === 'payments') {
                    chain.single.mockResolvedValue({ data: createdPayment, error: null });
                }
                return chain;
            });

            mockSupabase.rpc.mockImplementation((fn: string) => {
                const chain = createMockChain();
                if (fn === 'record_payment_transaction') {
                    chain.then = (resolve: any) => resolve({ data: transactionResult, error: null });
                }
                return chain;
            });

            await service.recordPayment(params, 'actor-1');

            expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('complete-allocation', expect.objectContaining({
                body: { allocation_id: params.allocationId }
            }));
        });
    });
});
