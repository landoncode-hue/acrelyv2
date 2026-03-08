import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/staff/invite/route';
import { getCurrentUser, getUserProfile } from '@/lib/auth/session';
import { StaffService } from '@/lib/services/StaffService';
import { logAudit } from '@/lib/audit';

// Mock dependencies
vi.mock('@/lib/auth/session');
vi.mock('@/lib/services/StaffService');
vi.mock('@/lib/audit');
vi.mock('@/lib/logger');

describe('POST /api/staff/invite', () => {
    let mockStaffService: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockStaffService = {
            inviteStaff: vi.fn(),
        };
        (StaffService as any).mockImplementation(function() {
            return mockStaffService;
        });


        (logAudit as any).mockResolvedValue({ success: true });
    });

    it('should return 403 if user is not sysadmin or CEO', async () => {
        (getCurrentUser as any).mockResolvedValue({ id: 'user-id', role: 'frontdesk' });

        const req = new NextRequest('http://localhost:3000/api/staff/invite', {
            method: 'POST',
            body: JSON.stringify({ email: 'staff@test.com', full_name: 'Staff Test', role: 'frontdesk' })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.error).toContain('Forbidden');
    });

    it('should successfully invite staff member', async () => {
        const adminUser = { id: 'admin-id', role: 'sysadmin', full_name: 'Admin User' };
        (getCurrentUser as any).mockResolvedValue(adminUser);
        
        mockStaffService.inviteStaff.mockResolvedValue({
            success: true,
            user: { id: 'new-user-id', email: 'staff@test.com', role: 'frontdesk' }
        });

        const req = new NextRequest('http://localhost:3000/api/staff/invite', {
            method: 'POST',
            body: JSON.stringify({
                email: 'staff@test.com',
                full_name: 'Staff Test',
                role: 'frontdesk',
                employee_id: 'STAFF-001'
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user.email).toBe('staff@test.com');
        expect(mockStaffService.inviteStaff).toHaveBeenCalledWith(expect.objectContaining({
            email: 'staff@test.com',
            role: 'frontdesk'
        }));
    });
});


