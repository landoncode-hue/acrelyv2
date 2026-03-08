import { Resend } from 'resend';
import { logger } from '@/lib/logger';

/**
 * Initialize Resend client
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Default sender email
 */
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Acrely <noreply@pinnaclegroups.ng>';

/**
 * Email sending options
 */
export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    metadata?: Record<string, any>;
    userId?: string;
}

/**
 * Email sending result
 */
export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Centralized email sending function
 * Uses Resend API and logs all emails to communication_logs
 * 
 * @param options - Email options
 * @returns Send result with message ID or error
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: Array.isArray(options.to) ? options.to : [options.to],
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        if (error) {
            logger.error('Resend error:', error);

            // Log failed email to communication_logs
            await logEmail({
                ...options,
                status: 'failed',
                error: error.message,
            });

            return {
                success: false,
                error: error.message,
            };
        }

        // Log successful email to communication_logs
        await logEmail({
            ...options,
            status: 'delivered',
            messageId: data?.id,
        });

        return {
            success: true,
            messageId: data?.id,
        };
    } catch (error: any) {
        logger.error('Email sending error:', error);

        // Log failed email
        await logEmail({
            ...options,
            status: 'failed',
            error: error.message,
        });

        return {
            success: false,
            error: error.message || 'Failed to send email',
        };
    }
}

/**
 * Log email to communication_logs table
 */
async function logEmail(options: SendEmailOptions & { status: string; messageId?: string; error?: string }) {
    // Mocked email logging
    logger.info(`Mocked logEmail: ${options.to} - ${options.status}`);
}

/**
 * Test email connectivity
 * Used by health check endpoint
 */
export async function testEmailConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
        if (!process.env.RESEND_API_KEY) {
            return { ok: false, error: 'RESEND_API_KEY not configured' };
        }

        // Resend doesn't have a dedicated health check endpoint
        // We'll just verify the API key is set
        return { ok: true };
    } catch (error: any) {
        return { ok: false, error: error.message };
    }
}
