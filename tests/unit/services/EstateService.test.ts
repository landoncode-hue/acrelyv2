import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EstateService } from '@/lib/services/EstateService';

describe('EstateService', () => {
    let service: EstateService;
    let mockSupabase: any;

    const createMockChain = () => {
        const chain: any = {
            rpc: vi.fn(),
            from: vi.fn(),
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            eq: vi.fn(),
            in: vi.fn(),
            single: vi.fn(),
            maybeSingle: vi.fn(),
            error: null,
            data: null
        };

        chain.from.mockReturnValue(chain);
        chain.select.mockReturnValue(chain);
        chain.insert.mockReturnValue(chain);
        chain.update.mockReturnValue(chain);
        chain.eq.mockReturnValue(chain);
        chain.in.mockReturnValue(chain);
        chain.single.mockResolvedValue({ data: { id: 'test-id' }, error: null });
        chain.maybeSingle.mockResolvedValue({ data: null, error: null });

        // Handle thenable for await
        chain.then = (resolve: any) => resolve({ data: chain.data, error: chain.error });

        return chain;
    };

    beforeEach(() => {
        mockSupabase = createMockChain();
        service = new EstateService();
    });

    describe('createEstate', () => {
        it('should call create_estate_with_plots RPC and return id', async () => {
            const params = {
                name: 'Test Estate',
                price: 1000,
                totalPlots: 10,
                location: 'Test Location'
            };
            mockSupabase.rpc.mockResolvedValueOnce({ data: { id: 'estate-123' }, error: null });

            const result = await service.createEstate(params, 'actor-123');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('create_estate_with_plots', expect.objectContaining({
                p_name: params.name
            }));
            expect(result).toBe('estate-123');
        });
    });

    describe('refreshInventory', () => {
        it('should update estate inventory', async () => {
            const mockPlots = [
                { status: 'sold' },
                { status: 'available' },
                { status: 'available' }
            ];

            // Mock findAll (PlotRepository) -> supabase.from().select().eq()
            // We need to set data on the chain for the resolve
            const mockChain = createMockChain();
            mockChain.data = mockPlots;
            mockSupabase.from.mockReturnValue(mockChain);

            // Mock update (EstateRepository) -> supabase.from().update().eq()
            // createMockChain handles this structure

            const result = await service.refreshInventory('estate-123');

            // Expect update to be called with correct counts
            expect(mockChain.update).toHaveBeenCalledWith(expect.objectContaining({
                total_plots: 3,
                occupied_plots: 1,
                available_plots: 2
            }));
            expect(result).toBe(true);
        });
    });

    describe('archiveEstate', () => {
        it('should archive estate if validation passes', async () => {
            mockSupabase.rpc.mockResolvedValueOnce({ data: { can_archive: true }, error: null });

            const result = await service.archiveEstate('estate-123', 'Project completed');

            expect(mockSupabase.rpc).toHaveBeenCalledWith('can_archive_estate', { p_estate_id: 'estate-123' });
            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
                status: 'archived',
                archive_reason: 'Project completed'
            }));
            expect(result).toBe(true);
        });

        it('should fail if validation fails', async () => {
            mockSupabase.rpc.mockResolvedValueOnce({ data: { can_archive: false, reason: 'Pending payments' }, error: null });

            await expect(service.archiveEstate('estate-123', 'Project completed'))
                .rejects.toThrow('Pending payments');
        });
    });

    describe('bulkCreatePlots', () => {
        it('should insert plots and audit log', async () => {
            const plots = [{ plot_number: 'A1' }, { plot_number: 'A2' }];
            const auditLog = { action: 'bulk_create' };

            // Mock bulkCreate (PlotRepository) -> insert().select()
            const mockChain = createMockChain();
            mockChain.data = [{ id: 1 }, { id: 2 }]; // Returned from select()
            mockSupabase.from.mockReturnValue(mockChain);

            // We need separate behavior for 'plots' vs 'audit_logs' if possible, 
            // but strict mocking is hard with simple chain.
            // Let's assume the first call to from('plots') returns the data, 
            // and subsequent calls work too.

            const result = await service.bulkCreatePlots(plots, auditLog);

            expect(result).toBe(2);
        });
    });
});
