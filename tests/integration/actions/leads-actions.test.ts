import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLeadAction, updateLeadAction, checkLeadConflictAction } from '@/lib/actions/leads-actions';
import { revalidatePath } from 'next/cache';
import { LeadsService } from '@/lib/services/LeadsService';
import { getCurrentUser } from '@/lib/auth/session';

// Mock modules
vi.mock('@/lib/auth/session');
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/services/LeadsService');

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('leads-actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createLeadAction', () => {
        const input = {
            full_name: 'John Lead',
            phone: '09012345678',
            source: 'web',
            assigned_to: 'agent-1'
        };

        it('should create lead successfully', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'agent-1', role: 'agent' });
            vi.mocked(LeadsService.prototype.createLead).mockResolvedValue({ success: true } as any);

            const result = await (createLeadAction as any)(input);

            expect(result.success).toBe(true);
            expect(LeadsService.prototype.createLead).toHaveBeenCalledWith(
                input,
                'agent-1'
            );
        });

    });

    describe('updateLeadAction', () => {
        it('should update lead successfully', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'agent-1', role: 'agent' });
            vi.mocked(LeadsService.prototype.updateLead).mockResolvedValue({ success: true } as any);

            const result = await (updateLeadAction as any)({ id: '00000000-0000-0000-0000-000000000000', status: 'contacted' });

            expect(result.success).toBe(true);
            expect(LeadsService.prototype.updateLead).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000', { status: 'contacted' });
        });
    });

    describe('checkLeadConflictAction', () => {
        it('should return conflict data', async () => {
            (getCurrentUser as any).mockResolvedValue({ id: 'agent-1', role: 'agent' });
            vi.mocked(LeadsService.prototype.checkConflict).mockResolvedValue({ found: true, type: 'Customer', name: 'Existing' } as any);

            const result = await (checkLeadConflictAction as any)('test@example.com');

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ found: true, type: 'Customer', name: 'Existing' });
        });
    });
});

