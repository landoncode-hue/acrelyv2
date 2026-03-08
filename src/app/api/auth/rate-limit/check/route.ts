import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getIpAddress } from '@/lib/auth/rate-limiter';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/rate-limit/check
 * Check if login attempt is allowed based on rate limiting
 * 
 * Request body:
 * {
 *   email: string;
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Handle empty body gracefully
        const text = await request.text();
        if (!text || text.trim() === '') {
            return NextResponse.json(
                { allowed: true, attemptsRemaining: 5, lockedUntil: null, minutesRemaining: 0 },
                { status: 200 }
            );
        }

        const body = JSON.parse(text);
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const ipAddress = getIpAddress(request.headers);
        const result = await checkRateLimit(email, ipAddress);

        // Calculate minutes remaining for user-friendly display
        let minutesRemaining = 0;
        if (result.lockedUntil) {
            const diff = result.lockedUntil.getTime() - Date.now();
            minutesRemaining = Math.ceil(diff / 60000);
        }

        return NextResponse.json({
            allowed: result.allowed,
            attemptsRemaining: result.attemptsRemaining,
            lockedUntil: result.lockedUntil?.toISOString(),
            minutesRemaining,
        });
    } catch (error: any) {
        logger.error('Rate limit check error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
