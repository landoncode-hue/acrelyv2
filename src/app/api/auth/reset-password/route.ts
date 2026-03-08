import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * POST /api/auth/reset-password
 * 
 * Step 1 (request reset): { email } → sends reset link
 * Step 2 (set new password): { token, password } → updates password
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Step 2: Token + new password → reset
        if (body.token && body.password) {
            return handlePasswordReset(body.token, body.password);
        }

        // Step 1: Email → send reset link
        if (body.email) {
            return handleResetRequest(body.email);
        }

        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
        );
    } catch (error) {
        logger.error('Reset password error', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

async function handleResetRequest(email: string) {
    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
    });

    try {
        const users = await sql<{ id: string; email: string }[]>`
            SELECT id, email FROM profiles
            WHERE email = ${email.toLowerCase().trim()}
            LIMIT 1
        `;

        if (!users[0]) return successResponse;

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store reset token (upsert)
        await sql`
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (${user.id}, ${token}, ${expiresAt})
            ON CONFLICT (user_id) DO UPDATE SET
                token = ${token},
                expires_at = ${expiresAt},
                created_at = NOW()
        `;

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/update-password?token=${token}`;

        // Send email via Resend (the app already has Resend configured)
        try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'noreply@acrely.com',
                to: user.email,
                subject: 'Reset Your Password — Acrely',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Password Reset</h2>
                        <p>You requested a password reset for your Acrely account.</p>
                        <p>Click the button below to set a new password. This link expires in 1 hour.</p>
                        <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">
                            Reset Password
                        </a>
                        <p style="color: #666; font-size: 14px;">If you didn't request this, ignore this email.</p>
                    </div>
                `,
            });
        } catch (emailError) {
            logger.error('Failed to send reset email', emailError);
        }

        logger.info('Password reset requested', { userId: user.id });
    } catch (error) {
        logger.error('Reset request error', error);
    }

    return successResponse;
}

async function handlePasswordReset(token: string, password: string) {
    if (password.length < 8) {
        return NextResponse.json(
            { error: 'Password must be at least 8 characters' },
            { status: 400 }
        );
    }

    // Look up valid token
    const tokens = await sql<{ user_id: string; expires_at: Date }[]>`
        SELECT user_id, expires_at FROM password_reset_tokens
        WHERE token = ${token}
        LIMIT 1
    `;

    if (!tokens[0]) {
        return NextResponse.json(
            { error: 'Invalid or expired reset link' },
            { status: 400 }
        );
    }

    const resetToken = tokens[0];

    if (new Date(resetToken.expires_at) < new Date()) {
        await sql`DELETE FROM password_reset_tokens WHERE token = ${token}`;
        return NextResponse.json(
            { error: 'This reset link has expired. Please request a new one.' },
            { status: 400 }
        );
    }

    // Hash new password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password, verify email, and activate staff if invited
    await sql`
        UPDATE profiles SET 
            password_hash = ${passwordHash},
            email_verified = true,
            staff_status = CASE WHEN staff_status = 'invited' THEN 'active' ELSE staff_status END
        WHERE id = ${resetToken.user_id}
    `;

    // Delete used token
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${resetToken.user_id}`;

    logger.info('Password reset completed', { userId: resetToken.user_id });

    return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully. You can now log in.',
    });
}
