import { NextRequest, NextResponse } from 'next/server';
import { recordFailedAttempt, resetAttempts, getIpAddress } from '@/lib/auth/rate-limiter';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/rate-limit/record
 * Record a login attempt (success or failure)
 * 
 * Request body:
 * {
 *   email: string;
 *   success: boolean;
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Handle empty body gracefully
        const text = await request.text();
        if (!text || text.trim() === '') {
            return NextResponse.json(
                { success: true },
                { status: 200 }
            );
        }

        const body = JSON.parse(text);
        const { email, success } = body;

        if (!email || typeof success !== 'boolean') {
            return NextResponse.json(
                { error: 'Email and success status are required' },
                { status: 400 }
            );
        }

        const ipAddress = getIpAddress(request.headers);
        const userAgent = request.headers.get('user-agent') || 'unknown';

        if (success) {
            // Reset attempts on successful login
            await resetAttempts(email, ipAddress);

            // Log successful login
            await logAudit({
                action_type: 'LOGIN_SUCCESS',
                changes: { email },
                ip_address: ipAddress,
                user_agent: userAgent,
            });
        } else {
            // Record failed attempt
            await recordFailedAttempt(email, ipAddress);

            // Log failed login
            await logAudit({
                action_type: 'LOGIN_FAILED',
                changes: { email, reason: 'Invalid credentials' },
                ip_address: ipAddress,
                user_agent: userAgent,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        logger.error('Rate limit record error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
