import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class SupportService {
    constructor() { }

    async getTickets(userId: string) {
        try {
            const data = await sql`
                SELECT * FROM support_tickets 
                WHERE user_id = ${userId}
                ORDER BY created_at DESC
            `;
            return data;
        } catch (error) {
            logger.error('SupportService.getTickets error', error);
            throw error;
        }
    }

    async createTicket(ticket: { userId: string; customerId?: string; subject: string; message: string }) {
        try {
            await sql`
                INSERT INTO support_tickets (
                    user_id,
                    customer_id,
                    subject,
                    message,
                    status
                ) VALUES (
                    ${ticket.userId},
                    ${ticket.customerId || null},
                    ${ticket.subject},
                    ${ticket.message},
                    'open'
                )
            `;
            return true;
        } catch (error) {
            logger.error('SupportService.createTicket error', error);
            throw error;
        }
    }

    async respondToTicket(ticketId: string, response: string, status: string = 'resolved') {
        try {
            const updateData: any = {
                admin_response: response,
                status,
                updated_at: new Date().toISOString()
            };

            if (status === 'resolved') {
                updateData.resolved_at = new Date().toISOString();
            }

            await sql`
                UPDATE support_tickets 
                SET ${sql(updateData)}
                WHERE id = ${ticketId}
            `;
            return true;
        } catch (error) {
            logger.error('SupportService.respondToTicket error', error);
            throw error;
        }
    }
}
