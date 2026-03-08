import sql from '@/lib/db';
import { BaseRepository } from './BaseRepository';
import { IAllocationRepository } from './interfaces/IAllocationRepository';
import { Allocation, AllocationWithDetails } from './types';
import { logger } from '@/lib/logger';

export class AllocationRepository extends BaseRepository<Allocation> implements IAllocationRepository {
    constructor() {
        super('allocations');
    }

    async createAllocationWorkflow(params: any): Promise<string[]> {
        try {
            const [result] = await sql<any[]>`
                SELECT create_allocation_workflow(
                    ${params.p_customer_id},
                    ${params.p_estate_id},
                    ${sql.json(params.p_plots)},
                    ${params.p_plan_type},
                    ${params.p_actor_id},
                    ${params.p_agent_id || null},
                    ${params.p_notes || null},
                    ${params.p_allocation_date || null},
                    ${params.p_initial_payment ? sql.json(params.p_initial_payment) : null}
                ) as created_ids
            `;
            return result.createdIds;
        } catch (error) {
            logger.error('AllocationRepository.createAllocationWorkflow error', error);
            throw error;
        }
    }

    async approveAllocation(allocationId: string, actorId: string): Promise<void> {
        try {
            await sql`SELECT approve_allocation_workflow(${allocationId}, ${actorId})`;
        } catch (error) {
            logger.error('AllocationRepository.approveAllocation error', error);
            throw error;
        }
    }

    async assignPlot(allocationId: string, plotId: string, plotSize: string, actorId: string, assignSuffix?: string): Promise<void> {
        try {
            await sql`
                SELECT assign_plot_workflow(
                    ${allocationId},
                    ${plotId},
                    ${plotSize},
                    ${actorId},
                    ${assignSuffix || null}
                )
            `;
        } catch (error) {
            logger.error('AllocationRepository.assignPlot error', error);
            throw error;
        }
    }

    async reassignPlot(allocationId: string, newPlotId: string, reason: string, actorId: string): Promise<void> {
        try {
            await sql`
                SELECT reassign_plot_workflow(
                    ${allocationId},
                    ${newPlotId},
                    ${reason},
                    ${actorId}
                )
            `;
        } catch (error) {
            logger.error('AllocationRepository.reassignPlot error', error);
            throw error;
        }
    }

    async cancelAllocation(allocationId: string, actorId: string, reason?: string): Promise<void> {
        try {
            await sql`
                SELECT cancel_allocation_workflow(
                    ${allocationId},
                    ${reason || null},
                    ${actorId}
                )
            `;
        } catch (error) {
            logger.error('AllocationRepository.cancelAllocation error', error);
            throw error;
        }
    }

    async completeAllocation(allocationId: string, actorId: string): Promise<void> {
        try {
            await sql`SELECT complete_allocation_workflow(${allocationId}, ${actorId})`;
        } catch (error) {
            logger.error('AllocationRepository.completeAllocation error', error);
            throw error;
        }
    }

    async findByIdWithDetails(id: string): Promise<AllocationWithDetails | null> {
        try {
            const [data] = await sql<any[]>`
                SELECT 
                    a.*,
                    json_build_object(
                        'id', c.id,
                        'full_name', c.full_name,
                        'phone', c.phone,
                        'email', c.email
                    ) as customer,
                    json_build_object('name', e.name) as estate,
                    json_build_object('plot_number', p.plot_number) as plot
                FROM allocations a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN estates e ON a.estate_id = e.id
                LEFT JOIN plots p ON a.plot_id = p.id
                WHERE a.id = ${id}
            `;
            return data as AllocationWithDetails || null;
        } catch (error) {
            logger.error('AllocationRepository.findByIdWithDetails error', error);
            return null;
        }
    }

    async findByCustomerId(customerId: string): Promise<Allocation[]> {
        return this.findAll({ customer_id: customerId } as any);
    }

    async findByStatus(status: string): Promise<Allocation[]> {
        return this.findAll({ status } as any);
    }

    async updateFinancials(id: string, data: { amount_paid: number; outstanding_balance: number }): Promise<void> {
        await this.update(id, data as Partial<Allocation>);
    }

    async findByIdWithFullDetails(id: string): Promise<any | null> {
        try {
            const [allocation] = await sql<any[]>`
                SELECT 
                    a.*,
                    (SELECT json_build_object(
                        'id', c.id,
                        'full_name', c.full_name,
                        'phone', c.phone,
                        'email', c.email,
                        'address', c.address,
                        'occupation', c.occupation
                    ) FROM customers c WHERE c.id = a.customer_id) as customers,
                    (SELECT json_build_object(
                        'id', e.id,
                        'name', e.name,
                        'location', e.location,
                        'description', e.description
                    ) FROM estates e WHERE e.id = a.estate_id) as estates,
                    (SELECT json_build_object(
                        'id', p.id,
                        'plot_number', p.plot_number,
                        'status', p.status,
                        'dimensions', p.dimensions,
                        'is_half_plot', p.is_half_plot,
                        'half_plot_designation', p.half_plot_designation
                    ) FROM plots p WHERE p.id = a.plot_id) as plots,
                    (SELECT COALESCE(json_agg(pm), '[]'::json) FROM payments pm WHERE pm.allocation_id = a.id) as payments,
                    (SELECT COALESCE(json_agg(
                        json_build_object(
                            'id', pp.id,
                            'plan_type', pp.plan_type,
                            'total_amount', pp.total_amount,
                            'status', pp.status,
                            'installments', (SELECT COALESCE(json_agg(ppi), '[]'::json) FROM payment_plan_installments ppi WHERE ppi.plan_id = pp.id)
                        )
                    ), '[]'::json) FROM payment_plans pp WHERE pp.allocation_id = a.id) as payment_plans,
                    (SELECT COALESCE(json_agg(
                        json_build_object(
                            'id', ar.id,
                            'old_plot_id', ar.old_plot_id,
                            'new_plot_id', ar.new_plot_id,
                            'reason', ar.reason,
                            'created_at', ar.created_at,
                            'changed_by_profile', (SELECT json_build_object('full_name', pr.full_name) FROM profiles pr WHERE pr.id = ar.changed_by)
                        )
                    ), '[]'::json) FROM allocation_reassignments ar WHERE ar.allocation_id = a.id) as allocation_reassignments
                FROM allocations a
                WHERE a.id = ${id}
            `;
            return allocation || null;
        } catch (error) {
            logger.error('AllocationRepository.findByIdWithFullDetails error', error);
            return null;
        }
    }

    async getAvailablePlots(estateId: string): Promise<any[]> {
        try {
            return await sql`
                SELECT id, plot_number, status, dimensions 
                FROM plots 
                WHERE estate_id = ${estateId} 
                AND status IN ('available', 'reserved')
                ORDER BY plot_number ASC
            `;
        } catch (error) {
            logger.error('AllocationRepository.getAvailablePlots error', error);
            return [];
        }
    }

    async findAllWithDetails(): Promise<any[]> {
        try {
            return await sql<any[]>`
                SELECT 
                    a.*,
                    c.full_name as customer_name,
                    e.name as estate_name,
                    COALESCE(p.plot_number, a.customer_facing_name, 'Unassigned') as plot_number
                FROM allocations a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN estates e ON a.estate_id = e.id
                LEFT JOIN plots p ON a.plot_id = p.id
                ORDER BY a.allocation_date DESC, a.created_at DESC
            `;
        } catch (error) {
            logger.error('AllocationRepository.findAllWithDetails error', error);
            return [];
        }
    }

    async getPendingApprovals(): Promise<any[]> {
        try {
            // This mimics the 'get_pending_approvals' RPC logic
            return await sql<any[]>`
                SELECT 
                    a.id as allocation_id,
                    c.full_name as customer_name,
                    c.phone as customer_phone,
                    e.name as estate_name,
                    p.plot_number,
                    a.total_price,
                    a.plan_type as payment_plan,
                    ap.full_name as agent_name,
                    db.full_name as drafted_by_name,
                    a.created_at,
                    EXTRACT(DAY FROM (NOW() - a.created_at))::int as days_pending
                FROM allocations a
                JOIN customers c ON a.customer_id = c.id
                JOIN estates e ON a.estate_id = e.id
                LEFT JOIN plots p ON a.plot_id = p.id
                LEFT JOIN profiles ap ON a.agent_id = ap.id
                LEFT JOIN profiles db ON a.created_by = db.id
                WHERE a.status = 'draft'
                ORDER BY a.created_at DESC
            `;
        } catch (error) {
            logger.error('AllocationRepository.getPendingApprovals error', error);
            return [];
        }
    }
}
