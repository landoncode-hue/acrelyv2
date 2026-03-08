import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class CommissionService {
    constructor() { }

    async getAgentByProfileId(profileId: string) {
        const data = await sql`
            SELECT id FROM agents WHERE profile_id = ${profileId}
        `;

        if (data.length === 0) return null;
        return data[0];
    }

    async getCommissions(agentId: string) {
        const data = await sql`
            SELECT * FROM commission_history 
            WHERE agent_id = ${agentId}
            ORDER BY created_at DESC
        `;

        return data;
    }

    async getWithdrawals(agentId: string) {
        const data = await sql`
            SELECT * FROM withdrawal_requests 
            WHERE agent_id = ${agentId}
            ORDER BY created_at DESC
        `;

        return data;
    }
}
