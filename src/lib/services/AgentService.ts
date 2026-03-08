import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class AgentService {
    constructor() { }

    async getAllProfiles() {
        try {
            return await sql<any[]>`
                SELECT id, full_name, email FROM profiles 
                ORDER BY full_name ASC
            `;
        } catch (error) {
            logger.error('AgentService.getAllProfiles error', error);
            throw error;
        }
    }

    async getAllAgents() {
        try {
            return await sql<any[]>`
                SELECT 
                    a.*,
                    p.full_name,
                    p.email,
                    p.phone,
                    p.role
                FROM agents a
                JOIN profiles p ON a.profile_id = p.id
                WHERE p.role = 'agent'
                ORDER BY a.created_at DESC
            `;
        } catch (error) {
            logger.error('AgentService.getAllAgents error', error);
            throw error;
        }
    }

    async getById(id: string) {
        try {
            const [agent] = await sql<any[]>`
                SELECT 
                    a.*,
                    p.full_name,
                    p.email,
                    p.phone,
                    p.role
                FROM agents a
                JOIN profiles p ON a.profile_id = p.id
                WHERE a.id = ${id}
            `;
            return agent;
        } catch (error) {
            logger.error('AgentService.getById error', error);
            throw error;
        }
    }

    async getAgentAllocations(agentProfileId: string) {
        try {
            return await sql<any[]>`
                SELECT 
                    a.*,
                    c.full_name as customer_name,
                    e.name as estate_name,
                    p.plot_number
                FROM allocations a
                JOIN customers c ON a.customer_id = c.id
                JOIN estates e ON a.estate_id = e.id
                JOIN plots p ON a.plot_id = p.id
                WHERE a.agent_id = ${agentProfileId}
                ORDER BY a.created_at DESC
            `;
        } catch (error) {
            logger.error('AgentService.getAgentAllocations error', error);
            throw error;
        }
    }

    async getAgentCommissions(agentId: string) {
        try {
            return await sql<any[]>`
                SELECT * FROM commission_history 
                WHERE agent_id = ${agentId} 
                ORDER BY created_at DESC
            `;
        } catch (error) {
            logger.error('AgentService.getAgentCommissions error', error);
            throw error;
        }
    }

    async getAgentWithdrawals(agentId: string) {
        try {
            return await sql<any[]>`
                SELECT * FROM withdrawal_requests 
                WHERE agent_id = ${agentId} 
                ORDER BY created_at DESC
            `;
        } catch (error) {
            logger.error('AgentService.getAgentWithdrawals error', error);
            throw error;
        }
    }

    async updateBankingDetails(profileId: string, details: { bank_name: string; account_number: string; account_name: string }) {
        try {
            await sql`
                UPDATE agents 
                SET ${sql(details)}
                WHERE profile_id = ${profileId}
            `;
            return true;
        } catch (error) {
            logger.error('AgentService.updateBankingDetails error', error);
            throw error;
        }
    }

    async getByProfileId(profileId: string) {
        try {
            const [agent] = await sql<any[]>`
                SELECT * FROM agents WHERE profile_id = ${profileId}
            `;
            return agent;
        } catch (error) {
            logger.error('AgentService.getByProfileId error', error);
            return null;
        }
    }

    async submitWithdrawalRequest(profileId: string, amount: number) {
        try {
            const agentRows = await sql`SELECT id, bank_name, account_number, account_name FROM agents WHERE profile_id = ${profileId}`;
            if (agentRows.length === 0) {
                throw new Error("Agent profile not found.");
            }
            const agent = agentRows[0];

            // Verify sufficient balance before accepting request
            const balanceRows = await sql`
                SELECT COALESCE(SUM(amount), 0) - (
                    SELECT COALESCE(SUM(amount), 0) FROM withdrawal_requests 
                    WHERE agent_id = ${agent.id} AND status IN ('pending', 'approved', 'paid')
                ) as available_balance
                FROM commission_history
                WHERE agent_id = ${agent.id}
            `;
            const availableBalance = balanceRows[0]?.available_balance || 0;

            if (amount > availableBalance) {
                throw new Error("Insufficient commission balance.");
            }

            const result = await sql`
                INSERT INTO withdrawal_requests (agent_id, amount, status, bank_name, account_number, account_name)
                VALUES (${agent.id}, ${amount}, 'pending', ${agent.bank_name}, ${agent.account_number}, ${agent.account_name})
                RETURNING *
            `;
            return result[0];
        } catch (error: any) {
            logger.error("Failed to submit withdrawal request", error);
            throw error;
        }
    }

    async processWithdrawalRequest(actorId: string, requestId: string, action: 'approve' | 'reject' | 'paid', data: { reason?: string; ref?: string } = {}) {
        try {
            // Use the new atomic workflow RPC
            await sql`
                SELECT process_withdrawal_workflow(
                    ${requestId},
                    ${action},
                    ${actorId},
                    ${data.reason || null},
                    ${data.ref || null}
                )
            `;

            // Fetch request details for notification
            const requests = await sql<any[]>`
                SELECT 
                    wr.*,
                    p.id as profile_id,
                    p.full_name,
                    p.email
                FROM withdrawal_requests wr
                JOIN agents a ON wr.agent_id = a.id
                JOIN profiles p ON a.profile_id = p.id
                WHERE wr.id = ${requestId}
            `;
            const request = requests[0];

            // Send Email Notification (Async via communication_logs)
            if (request && request.email) {
                const amountFormatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(request.amount);

                let subject = `Withdrawal Request Update`;
                let message = ``;

                if (action === 'paid') {
                    subject = `Commission Payment Sent: ${amountFormatted}`;
                    message = `Dear ${request.full_name},\n\nYour withdrawal request for ${amountFormatted} has been processed and paid.\nTransaction Ref: ${data.ref || 'N/A'}\n\nThank you for your hard work!`;
                } else if (action === 'reject') {
                    subject = `Withdrawal Request Rejected`;
                    message = `Dear ${request.full_name},\n\nYour withdrawal request for ${amountFormatted} was rejected.\nReason: ${data.reason || 'Not specified'}\n\nPlease contact support for more details.`;
                } else if (action === 'approve') {
                    subject = `Withdrawal Request Approved`;
                    message = `Dear ${request.full_name},\n\nYour withdrawal request for ${amountFormatted} has been approved and is queued for payment.`;
                }

                await sql`
                    INSERT INTO communication_logs (
                        type,
                        recipient,
                        subject,
                        content,
                        metadata
                    ) VALUES (
                        'email',
                        ${request.email},
                        ${subject},
                        ${message},
                        ${JSON.stringify({
                    userId: request.profile_id,
                    action: 'withdrawal-update',
                    status: action
                })}
                    )
                `;
            }

            return request;
        } catch (error) {
            logger.error("AgentService.processWithdrawalRequest error", error);
            throw error;
        }
    }

    async updateAgent(agentId: string, data: { commission_rate?: number; status?: 'active' | 'pending' | 'suspended' | 'rejected'; bank_name?: string; account_number?: string; account_name?: string }) {
        try {
            await sql`
                UPDATE agents 
                SET ${sql(data)}
                WHERE id = ${agentId}
            `;
            return true;
        } catch (error) {
            logger.error('AgentService.updateAgent error', error);
            throw error;
        }
    }

    async approveAgent(agentId: string) {
        return this.updateAgent(agentId, { status: 'active' });
    }

    async rejectAgent(agentId: string) {
        return this.updateAgent(agentId, { status: 'rejected' });
    }

    async registerAgent(data: {
        profile_id: string;
        commission_rate: number;
        bank_name?: string;
        account_number?: string;
        account_name?: string;
        status?: string;
    }) {
        try {
            const [agent] = await sql<any[]>`
                INSERT INTO agents ${sql(data)}
                RETURNING *
            `;
            return agent;
        } catch (error) {
            logger.error('AgentService.registerAgent error', error);
            throw error;
        }
    }
}
