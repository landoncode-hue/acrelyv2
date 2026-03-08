import sql from '@/lib/db';
import { logger } from '@/lib/logger';
import { Lead } from '../repositories/types';

export type CreateLeadParams = {
    full_name: string;
    email?: string;
    phone: string;
    source: string;
    interest?: string;
    assigned_to?: string;
    next_follow_up_at?: string;
};

export class LeadsService {
    constructor() { }

    async getLeads(): Promise<Lead[]> {
        const data = await sql<any[]>`
            SELECT 
                l.*,
                json_build_object('full_name', p.full_name) as profiles
            FROM leads l
            LEFT JOIN profiles p ON l.assigned_to = p.id
            ORDER BY l.next_follow_up_at ASC NULLS LAST
        `;

        return data as unknown as Lead[];
    }

    async createLead(params: CreateLeadParams, createdBy: string) {
        logger.info('LeadsService.createLead: Creating lead via atomic RPC', { fullName: params.full_name, createdBy });

        try {
            // Get actor role for auditing
            const profiles = await sql<any[]>`
                SELECT role FROM profiles WHERE id = ${createdBy}
            `;
            const profile = profiles[0];

            const result = await sql`
                SELECT create_lead_workflow(
                    ${params.full_name},
                    ${params.phone},
                    ${params.email || null},
                    ${params.source},
                    ${params.interest || null},
                    ${params.assigned_to || null},
                    ${createdBy},
                    ${profile?.role || 'agent'}
                ) as data
            `;

            return result[0].data;
        } catch (error: any) {
            logger.error('LeadsService.createLead: SQL failed', error);
            // If it's a conflict error, it might be JSON stringified in the message if the DB function raises it that way
            if (error.message && error.message.startsWith('{')) {
                const conflict = JSON.parse(error.message);
                throw new Error(`Conflict: ${conflict.name} already exists as a ${conflict.type}, registered by ${conflict.agent}`);
            }
            throw error;
        }
    }

    async updateLead(id: string, updates: any) {
        try {
            await sql`
                UPDATE leads SET ${sql(updates)} WHERE id = ${id}
            `;
            return true;
        } catch (error) {
            logger.error('LeadsService.updateLead error', error);
            throw error;
        }
    }

    async deleteLead(id: string) {
        try {
            await sql`DELETE FROM leads WHERE id = ${id}`;
            return true;
        } catch (error) {
            logger.error('LeadsService.deleteLead error', error);
            throw error;
        }
    }

    async checkConflict(email?: string, phone?: string) {
        if (!email && !phone) return null;

        try {
            const result = await sql`
                SELECT check_lead_conflict(
                    ${email || null},
                    ${phone || null}
                ) as conflict_data
            `;

            const data = result[0].conflict_data;
            return data.found ? data : null;
        } catch (error) {
            logger.error('LeadsService.checkConflict: SQL failed', error);
            throw error;
        }
    }

    async convertLead(leadId: string, actorId: string, additionalData?: {
        email?: string;
        address?: string;
        occupation?: string;
        nextOfKinName?: string;
        nextOfKinPhone?: string;
    }) {
        logger.info('LeadsService.convertLead: Starting atomic conversion', { leadId, actorId });

        try {
            // Get user role
            const profiles = await sql<any[]>`
                SELECT role FROM profiles WHERE id = ${actorId}
            `;
            const profile = profiles[0];

            if (!profile) throw new Error("Profile not found");

            const result = await sql`
                SELECT convert_lead_workflow(
                    ${leadId},
                    ${actorId},
                    ${profile.role},
                    ${additionalData?.email || null},
                    ${additionalData?.address || null},
                    ${additionalData?.occupation || null},
                    ${additionalData?.nextOfKinName || null},
                    ${additionalData?.nextOfKinPhone || null}
                ) as data
            `;

            const data = result[0].data;
            logger.info('LeadsService.convertLead: Success', { customerId: data.id });
            return data;
        } catch (error) {
            logger.error('LeadsService.convertLead: SQL failed', error);
            throw error;
        }
    }

    async getLeadsByAgent(agentId: string): Promise<Lead[]> {
        const data = await sql<any[]>`
            SELECT * FROM leads 
            WHERE created_by = ${agentId}
            ORDER BY created_at DESC
        `;
        return data as unknown as Lead[];
    }
}
