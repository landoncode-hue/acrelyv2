import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadsService } from '@/lib/services/LeadsService';

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('LeadsService', () => {
    let mockSupabase: any;
    let service: LeadsService;

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

        // Default then implementation for awaiting the chain (builders)
        chain.then.mockImplementation((onFulfilled: any) => {
            return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        });

        return chain;
    };

    beforeEach(() => {
        mockSupabase = createMockChain();
        service = new LeadsService();
    });

    describe('convertLead', () => {
        const leadId = 'lead-123';
        const actorId = 'actor-456';

        it('should convert a lead to a customer', async () => {
            // 1. Mock profile check
            mockSupabase.from.mockImplementation((table: string) => {
                const chain = createMockChain();
                if (table === 'profiles') {
                    chain.single.mockResolvedValue({ data: { role: 'agent' }, error: null });
                }
                return chain;
            });

            // 2. Mock RPC conversion
            mockSupabase.rpc.mockImplementation((fn: string) => {
                const chain = createMockChain();
                if (fn === 'convert_lead_workflow') {
                    chain.then = (resolve: any) => resolve({ data: { id: 'cust-789' }, error: null });
                }
                return chain;
            });

            const result = await service.convertLead(leadId, actorId);

            expect(result.id).toBe('cust-789');
            expect(mockSupabase.rpc).toHaveBeenCalledWith('convert_lead_workflow', expect.objectContaining({
                p_lead_id: leadId,
                p_actor_id: actorId
            }));
        });

        it('should return error if RPC fails', async () => {
            // 1. Mock profile check
            mockSupabase.from.mockImplementation((table: string) => {
                const chain = createMockChain();
                if (table === 'profiles') {
                    chain.single.mockResolvedValue({ data: { role: 'agent' }, error: null });
                }
                return chain;
            });

            // 2. Mock RPC failure
            mockSupabase.rpc.mockImplementation((fn: string) => {
                const chain = createMockChain();
                if (fn === 'convert_lead_workflow') {
                    chain.then = (resolve: any) => resolve({ data: null, error: { message: 'Conversion failed' } });
                }
                return chain;
            });

            await expect(service.convertLead(leadId, actorId)).rejects.toThrow('Conversion failed');
        });
    });
});
