import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser, setSessionCookie, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { signToken } from '@/lib/auth/jwt';
import { logger } from '@/lib/logger';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
        }

        // Validate token
        const tokens = await sql<{ expires_at: Date }[]>`
            SELECT expires_at 
            FROM password_reset_tokens 
            WHERE user_id = ${user.id} AND token = ${token}
            LIMIT 1
        `;

        if (tokens.length === 0) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
        }

        if (new Date(tokens[0].expires_at) < new Date()) {
            await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`;
            return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
        }

        // Mark as verified
        await sql`
            UPDATE profiles 
            SET email_verified = true 
            WHERE id = ${user.id}
        `;

        await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`;

        // Get user profile details to sign a new token with email_verified: true
        const profiles = await sql<{ email: string; role: string; is_staff: boolean; email_verified: boolean }[]>`
            SELECT email, role, is_staff, email_verified
            FROM profiles
            WHERE id = ${user.id}
            LIMIT 1
        `;

        if (profiles.length > 0) {
            const profile = profiles[0];

            const newToken = await signToken({
                sub: user.id,
                email: profile.email,
                role: profile.role,
                is_staff: profile.is_staff,
                email_verified: profile.email_verified,
            });

            const response = NextResponse.json({
                success: true,
                message: 'Email verified successfully.',
                redirect: profile.is_staff ? '/dashboard' : '/portal'
            });

            response.cookies.set(SESSION_COOKIE_NAME, newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            await logAudit({
                action: 'EMAIL_VERIFIED',
                actor_user_id: user.id,
                actor_role: profile.role,
                details: { email: profile.email }
            });

            return response;
        }

        return NextResponse.json({ error: 'Profile lookup failed' }, { status: 500 });

    } catch (error) {
        logger.error('Verify email error', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
