import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/lib/db';
import { signToken } from '@/lib/auth/jwt';
import { setSessionCookie, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt, resetAttempts, getLockoutMessage } from '@/lib/auth/rate-limiter';
import { getIpAddress } from '@/lib/auth/rate-limiter';
import { logAudit } from '@/lib/audit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const ipAddress = getIpAddress(request.headers);

        // Check rate limit
        const rateLimit = await checkRateLimit(email, ipAddress);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: getLockoutMessage(rateLimit.lockedUntil!) },
                { status: 429 }
            );
        }

        // Look up user by email
        const users = await sql<{ id: string; email: string; password_hash: string; role: string; is_staff: boolean; full_name: string; staff_status: string; email_verified: boolean }[]>`
            SELECT id, email, password_hash, role, is_staff, full_name, staff_status, email_verified
            FROM profiles
            WHERE email = ${email.toLowerCase().trim()}
            LIMIT 1
        `;

        const user = users[0];

        if (!user || !user.password_hash) {
            await recordFailedAttempt(email, ipAddress);
            await logAudit({
                action: 'LOGIN_FAILED',
                details: { email, reason: 'invalid_credentials' },
                ip_address: ipAddress,
            });
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if staff account is suspended/deactivated
        if (user.is_staff && user.staff_status && !['active', 'invited'].includes(user.staff_status)) {
            return NextResponse.json(
                { error: 'Your account has been suspended. Contact your administrator.' },
                { status: 403 }
            );
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordValid) {
            await recordFailedAttempt(email, ipAddress);
            await logAudit({
                action: 'LOGIN_FAILED',
                actor_user_id: user.id,
                details: { reason: 'invalid_password' },
                ip_address: ipAddress,
            });
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Success — reset rate limit and issue JWT
        await resetAttempts(email, ipAddress);

        const token = await signToken({
            sub: user.id,
            email: user.email,
            role: user.role,
            is_staff: user.is_staff,
            email_verified: user.email_verified,
        });

        // Set cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                is_staff: user.is_staff,
                email_verified: user.email_verified,
            },
        });

        response.cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        await logAudit({
            action: 'LOGIN_SUCCESS',
            actor_user_id: user.id,
            actor_role: user.role,
            ip_address: ipAddress,
        });

        logger.info('Login successful', { userId: user.id, email: user.email });

        return response;
    } catch (error) {
        logger.error('Login error', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
