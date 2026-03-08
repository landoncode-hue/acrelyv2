import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        // Store OTP in password_reset_tokens 
        // We reuse this table because it maps user_id to a temporary token
        await sql`
            INSERT INTO password_reset_tokens (user_id, token, expires_at)
            VALUES (${user.id}, ${otp}, ${expiresAt})
            ON CONFLICT (user_id) DO UPDATE SET 
                token = ${otp}, 
                expires_at = ${expiresAt},
                created_at = NOW()
        `;

        // Get user details
        const users = await sql<{ email: string; full_name: string }[]>`
            SELECT email, full_name 
            FROM profiles 
            WHERE id = ${user.id} 
            LIMIT 1
        `;

        if (users.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const email = users[0].email;
        const name = users[0].full_name;

        // Send email via Resend
        try {
            const { Resend } = await import('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);

            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || 'noreply@acrely.com',
                to: email,
                subject: 'Verify your email - Acrely',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Email Verification</h2>
                        <p>Hi ${name},</p>
                        <p>Your verification code is:</p>
                        <h1 style="font-size: 32px; letter-spacing: 4px; background: #f4f4f5; padding: 12px; text-align: center; border-radius: 6px;">${otp}</h1>
                        <p>This code expires in 15 minutes. If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
            logger.info('Verification email sent', { userId: user.id });
        } catch (emailError) {
            logger.error('Failed to send verification email', emailError);
            // We still return success so the frontend continues, but we log the error.
        }

        return NextResponse.json({ success: true, message: 'Verification code sent to your email.' });
    } catch (error) {
        logger.error('Send verification error', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
