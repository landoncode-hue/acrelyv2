import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { StaffService } from '@/lib/services/StaffService';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, full_name, role, employee_id } = body;

        if (!email || !full_name || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user has permission (sysadmin or CEO)
        if (!['sysadmin', 'ceo'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const staffService = new StaffService();
        const result = await staffService.inviteStaff({
            email,
            full_name,
            role,
            employee_id,
            invited_by: user.id,
            inviter_name: user.full_name || 'Administrator'
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, user: result.user });
    } catch (error: any) {
        console.error('Staff Invite Route Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}


