import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AllocationService, CreateAllocationParams } from '@/lib/services/AllocationService';

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('AllocationService', () => {
    let mockSupabase: any;
    let service: AllocationService;

    // Helper to create a fluent mock chain
    const createMockChain = () => {
        const chain: any = {
            from: vi.fn(),
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            eq: vi.fn(),
            in: vi.fn(),
            neq: vi.fn(),
            single: vi.fn(),
            rpc: vi.fn(),
        };

        chain.from.mockReturnValue(chain);
        chain.select.mockReturnValue(chain);
        chain.insert.mockReturnValue(chain);
        chain.update.mockReturnValue(chain);
        chain.delete.mockReturnValue(chain);
        chain.eq.mockReturnValue(chain);
        chain.in.mockReturnValue(chain);
        chain.neq.mockReturnValue(chain);
        chain.single.mockResolvedValue({ data: null, error: null });
        chain.rpc.mockResolvedValue({ data: null, error: null });

        return chain;
    };

    beforeEach(() => {
        mockSupabase = createMockChain();
        service = new AllocationService();
    });

    describe('createRequest', () => {
        it('should call create_allocation_workflow RPC', async () => {
            const params: CreateAllocationParams = {
                customerId: 'cust-123',
                estateId: 'estate-456',
                plots: [{ id: 'plot-1', plot_number: 'P-1', price: 5000000, size: 'full_plot' }],
                planType: 'outright',
                plotSize: 'full_plot',
            };

            mockSupabase.rpc.mockResolvedValue({ data: ['alloc-uuid'], error: null });

            const result = await service.createRequest(params, 'actor-1');

            expect(result).toEqual(['alloc-uuid']);
            expect(mockSupabase.rpc).toHaveBeenCalledWith('create_allocation_workflow', expect.objectContaining({
                p_customer_id: 'cust-123',
                p_estate_id: 'estate-456',
                p_plots: expect.any(Array),
                p_actor_id: 'actor-1'
            }));
        });
    });

    describe('approve', () => {
        it('should call approve_allocation_workflow RPC', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

            await service.approve('alloc-1', 'actor-1');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('approve_allocation_workflow', {
                p_allocation_id: 'alloc-1',
                p_actor_id: 'actor-1'
            });
        });
    });

    describe('assignPlot', () => {
        it('should call assign_plot_workflow RPC', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

            await service.assignPlot('alloc-1', 'plot-1', 'full_plot', 'actor-1', '-A');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('assign_plot_workflow', {
                p_allocation_id: 'alloc-1',
                p_plot_id: 'plot-1',
                p_plot_size: 'full_plot',
                p_actor_id: 'actor-1',
                p_assign_suffix: '-A'
            });
        });
    });

    describe('reassign', () => {
        it('should call reassign_plot_workflow RPC', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

            await service.reassign('alloc-1', 'new-plot-1', 'upgrade', 'actor-1');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('reassign_plot_workflow', {
                p_allocation_id: 'alloc-1',
                p_new_plot_id: 'new-plot-1',
                p_reason: 'upgrade',
                p_actor_id: 'actor-1'
            });
        });
    });

    describe('cancel', () => {
        it('should call cancel_allocation_workflow RPC', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

            await service.cancel('alloc-1', 'changed mind', 'actor-1');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('cancel_allocation_workflow', {
                p_allocation_id: 'alloc-1',
                p_reason: 'changed mind',
                p_actor_id: 'actor-1'
            });
        });
    });

    describe('complete', () => {
        it('should call complete_allocation_workflow RPC', async () => {
            mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
            // Mock notify fetch
            mockSupabase.single.mockResolvedValue({ data: { id: 'alloc-1', status: 'completed' }, error: null });

            await service.complete('alloc-1', 'actor-1', 'admin');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('complete_allocation_workflow', {
                p_allocation_id: 'alloc-1',
                p_actor_id: 'actor-1'
            });
        });
    });
});
