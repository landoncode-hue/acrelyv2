import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteService } from '@/lib/services/DeleteService';

describe('DeleteService', () => {
    let service: DeleteService;
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            rpc: vi.fn(),
            from: vi.fn(() => ({
                delete: vi.fn(() => ({
                    eq: vi.fn(() => Promise.resolve({ error: null }))
                }))
            }))
        };
        service = new DeleteService();
    });

    describe('deleteCustomer', () => {
        it('should call delete_customer_cascade RPC and return success', async () => {
            mockSupabase.rpc.mockResolvedValueOnce({ error: null });

            const result = await service.deleteCustomer('cust-123');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('delete_customer_cascade', {
                target_customer_id: 'cust-123'
            });
            expect(result).toBe(true);
        });

        it('should return error if RPC fails', async () => {
            mockSupabase.rpc.mockResolvedValueOnce({ error: { message: 'Database error' } });

            await expect(service.deleteCustomer('cust-123')).rejects.toEqual({ message: 'Database error' });
        });
    });

    describe('deleteAllocation', () => {
        it('should call delete_allocation_cascade RPC and return success', async () => {
            mockSupabase.rpc.mockResolvedValueOnce({ error: null });

            const result = await service.deleteAllocation('alloc-123');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('delete_allocation_cascade', {
                target_allocation_id: 'alloc-123'
            });
            expect(result).toBe(true);
        });
    });

    describe('deletePayment', () => {
        it('should delete from payments table and return success', async () => {
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockResolvedValueOnce({ error: null });
            mockSupabase.from.mockReturnValueOnce({ delete: mockDelete, eq: mockEq });

            const result = await service.deletePayment('pay-123');

            expect(mockSupabase.from).toHaveBeenCalledWith('payments');
            expect(mockEq).toHaveBeenCalledWith('id', 'pay-123');
            expect(result).toBe(true);
        });
    });

    describe('deleteLead', () => {
        it('should delete from leads table and return success', async () => {
            const mockDelete = vi.fn().mockReturnThis();
            const mockEq = vi.fn().mockResolvedValueOnce({ error: null });
            mockSupabase.from.mockReturnValueOnce({ delete: mockDelete, eq: mockEq });

            const result = await service.deleteLead('lead-123');

            expect(mockSupabase.from).toHaveBeenCalledWith('leads');
            expect(mockEq).toHaveBeenCalledWith('id', 'lead-123');
            expect(result).toBe(true);
        });
    });
});
