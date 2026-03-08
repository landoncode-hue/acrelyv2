import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export interface SendMessageParams {
    userId?: string;
    customerId?: string;
    recipient: string;
    body: string;
    subject?: string;
    channel: 'sms' | 'email';
    metadata?: any;
}

export class CommunicationService {
    constructor() { }

    /**
     * Universal message logger to communication_logs.
     * In the new non-Supabase architecture, this records intent which can be picked up by a separate worker.
     */
    async sendMessage(params: SendMessageParams) {
        logger.info('Logging communication...', { channel: params.channel, recipient: params.recipient });

        try {
            // Map customerId or userId to the profile id column in communication_logs
            const targetProfileId = params.userId || params.customerId;

            await sql`
                INSERT INTO communication_logs (
                    user_id, 
                    channel, 
                    type, 
                    message, 
                    status, 
                    meta
                )
                VALUES (
                    ${targetProfileId || null}, 
                    ${params.channel}, 
                    'transactional', 
                    ${params.body},
                    'pending',
                    ${sql.json({
                recipient: params.recipient,
                subject: params.subject,
                ...params.metadata
            })}
                )
            `;

            return { success: true, message: 'Message logged to communication_logs' };
        } catch (error) {
            logger.error('Failed to log message to communication_logs', { error, params });
            throw error;
        }
    }

    /**
     * Specialized method for SMS
     */
    async sendSMS(to: string, message: string, userId?: string, customerId?: string) {
        return this.sendMessage({
            channel: 'sms',
            recipient: to,
            body: message,
            userId,
            customerId
        });
    }

    /**
     * Specialized method for Email
     */
    async sendEmail(to: string, subject: string, body: string, userId?: string, customerId?: string) {
        return this.sendMessage({
            channel: 'email',
            recipient: to,
            subject,
            body,
            userId,
            customerId
        });
    }

    /**
     * Specialized method for In-App Notifications
     */
    async sendInAppNotification(userId: string, title: string, body: string) {
        logger.info('In-app notification requested', { userId, title });

        await sql`
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (${userId}, ${title}, ${body}, 'info')
        `;

        return { success: true, message: 'In-app notification created' };
    }

    /**
     * Fetches communication metrics for a given date.
     */
    async getCommunicationMetrics(date: string) {
        const [sent, failed, scheduled, retrying, overdue] = await Promise.all([
            sql`SELECT COUNT(*) FROM communication_logs WHERE sent_at::date = ${date} AND status = 'delivered'`,
            sql`SELECT COUNT(*) FROM communication_logs WHERE sent_at::date = ${date} AND status = 'failed'`,
            sql`SELECT COUNT(*) FROM scheduled_communications WHERE status = 'pending'`,
            sql`SELECT COUNT(*) FROM scheduled_communications WHERE status = 'pending' AND attempt_count > 0`,
            sql`
                SELECT COUNT(DISTINCT a.customer_id) 
                FROM payment_plan_installments ppi
                JOIN payment_plans pp ON ppi.plan_id = pp.id
                JOIN allocations a ON pp.allocation_id = a.id
                WHERE ppi.status = 'overdue'
            `
        ]);

        return {
            sentToday: parseInt(sent[0].count),
            failedToday: parseInt(failed[0].count),
            scheduled: parseInt(scheduled[0].count),
            retrying: parseInt(retrying[0].count),
            uniqueOverdueCustomers: parseInt(overdue[0].count)
        };
    }

    /**
     * Fetches communication logs for a date range.
     */
    async getCommunicationLogs(startDate: string, endDate: string) {
        return await sql`
            SELECT channel, sent_at 
            FROM communication_logs 
            WHERE sent_at >= ${startDate} AND sent_at <= ${endDate}
        `;
    }
}
