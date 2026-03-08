import sql from '@/lib/db';
import { logger } from '@/lib/logger';
import { AllocationRepository } from '../repositories/AllocationRepository';
import { PlotRepository } from '../repositories/PlotRepository';
import { CustomerRepository } from '../repositories/CustomerRepository';

export interface CreateAllocationParams {
    customerId: string;
    estateId: string;
    plots: {
        id: string | null;
        plot_number: string;
        price: number;
        size: 'full_plot' | 'half_plot';
        preferredSuffix?: string;
    }[];
    planType: string;
    plotSize: 'full_plot' | 'half_plot';
    agentId?: string | null;
    notes?: string;
    customPrice?: number;
    allocationDate?: string;
    initialPayment?: {
        amount: number;
        method: string;
        reference?: string;
        date?: string;
    };
}

export class AllocationService {
    private allocationRepository: AllocationRepository;
    private plotRepository: PlotRepository;
    private customerRepository: CustomerRepository;

    constructor() {
        this.allocationRepository = new AllocationRepository();
        this.plotRepository = new PlotRepository();
        this.customerRepository = new CustomerRepository();
    }

    async createRequest(params: CreateAllocationParams, actorId: string): Promise<string[]> {
        logger.info('AllocationService.createRequest: Starting', { params, actorId });

        const normalizedPlots = params.plots.map(p => ({
            ...p,
            id: (p.id === 'unassigned' || !p.id) ? null : p.id
        }));

        const effectivePlots = normalizedPlots.length > 0
            ? normalizedPlots
            : [{ id: null, plot_number: 'Unassigned', price: 0, size: params.plotSize }];

        const pricePerAllocation = params.customPrice
            ? params.customPrice / effectivePlots.length
            : null;

        const rpcPlots = effectivePlots.map(p => ({
            id: p.id,
            plot_number: p.plot_number,
            price: pricePerAllocation ?? p.price,
            size: p.size,
            preferredSuffix: p.preferredSuffix
        }));

        const allocationIds = await this.allocationRepository.createAllocationWorkflow({
            p_customer_id: params.customerId,
            p_estate_id: params.estateId,
            p_plots: rpcPlots,
            p_plan_type: params.planType,
            p_actor_id: actorId,
            p_agent_id: params.agentId || null,
            p_notes: params.notes || null,
            p_allocation_date: params.allocationDate || new Date().toISOString(),
            p_initial_payment: params.initialPayment ? {
                amount: params.initialPayment.amount,
                method: params.initialPayment.method,
                reference: params.initialPayment.reference,
                date: params.initialPayment.date
            } : null
        });

        if (allocationIds.length > 0) {
            this.notifyAdmins(allocationIds).catch(err =>
                logger.error('AllocationService: Failed to notify admins', err)
            );
        }

        logger.info('AllocationService.createRequest: Success', { createdAllocationIds: allocationIds });
        return allocationIds;
    }

    async approve(allocationId: string, actorId: string): Promise<boolean> {
        logger.info('AllocationService.approve: Starting', { allocationId, actorId });

        await this.allocationRepository.approveAllocation(allocationId, actorId);

        logger.info('AllocationService.approve: Success');
        return true;
    }

    async assignPlot(allocationId: string, plotId: string, plotSize: 'full_plot' | 'half_plot', actorId: string, assignSuffix?: string): Promise<boolean> {
        logger.info('AllocationService.assignPlot: Starting', { allocationId, plotId, actorId, assignSuffix });

        await this.allocationRepository.assignPlot(allocationId, plotId, plotSize, actorId, assignSuffix);

        return true;
    }

    async reassign(allocationId: string, newPlotId: string, reason: string, actorId: string): Promise<boolean> {
        logger.info('AllocationService.reassign: Starting', { allocationId, newPlotId, actorId });

        try {
            await sql`
                SELECT reassign_plot_workflow(
                    ${allocationId},
                    ${newPlotId},
                    ${reason},
                    ${actorId}
                )
            `;
            return true;
        } catch (error) {
            logger.error('AllocationService.reassign error', error);
            throw error;
        }
    }

    async cancel(allocationId: string, reason: string, actorId: string): Promise<boolean> {
        await this.allocationRepository.cancelAllocation(allocationId, actorId, reason);
        return true;
    }

    async complete(allocationId: string, actorId: string, actorRole: string): Promise<boolean> {
        logger.info('AllocationService.complete: Starting', { allocationId, actorId });

        await this.allocationRepository.completeAllocation(allocationId, actorId);

        const allocation = await this.allocationRepository.findByIdWithDetails(allocationId);

        if (!allocation) {
            logger.error('AllocationService.complete: Failed to fetch details for notification');
            return true;
        }

        const completionDate = new Date().toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (allocation.customer?.phone) {
            await sql`
                INSERT INTO communication_logs (user_id, channel, type, message, status, meta)
                VALUES (
                    ${allocation.customer_id}, 
                    'sms', 
                    'transactional', 
                    ${`Congratulations ${allocation.customer.full_name}! Your allocation for ${allocation.estate?.name} - Plot ${allocation.plot?.plot_number || 'Unassigned'} is now FULLY PAID! Total: ₦${allocation.total_price.toFixed(2)}. Thank you for your business.`},
                    'pending',
                    ${sql.json({ recipient: allocation.customer.phone })}
                )
            `;
        }

        if (allocation.customer?.email) {
            await sql`
                INSERT INTO communication_logs (user_id, channel, type, message, status, meta)
                VALUES (
                    ${allocation.customer_id}, 
                    'email', 
                    'transactional', 
                    ${`Dear ${allocation.customer.full_name},\n\nCongratulations! You have successfully completed payment for your allocation.\n\nEstate: ${allocation.estate?.name}\nPlot: ${allocation.plot?.plot_number || 'Unassigned'}\nTotal Paid: ₦${allocation.total_price.toFixed(2)}\nCompletion Date: ${completionDate}\n\nYour allocation is now fully paid. Our team will contact you regarding the next steps for documentation and plot handover.\n\nThank you for choosing Acrely!\n\nBest regards,\nAcrely Team`},
                    'pending',
                    ${sql.json({ recipient: allocation.customer.email, subject: `Allocation Completed - ${allocation.estate?.name}` })}
                )
            `;
        }

        return true;
    }

    private async notifyAdmins(allocationIds: string[]) {
        try {
            const allocations = await sql<any[]>`
                SELECT a.*, c.full_name as customer_name, e.name as estate_name, p.plot_number
                FROM allocations a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN estates e ON a.estate_id = e.id
                LEFT JOIN plots p ON a.plot_id = p.id
                WHERE a.id IN (${allocationIds})
            `;

            if (!allocations || allocations.length === 0) return;

            const count = allocations.length;
            const first = allocations[0];
            const customerName = first.customer_name || 'A customer';
            const estateName = first.estate_name || 'Estate';

            const totalVal = allocations.reduce((sum, a) => sum + (Number(a.total_price) || 0), 0);

            const message = `New Allocation Drafts: ${customerName} is purchasing ${count} plot(s) at ${estateName}. Total: ₦${totalVal.toLocaleString()}. Pending approval.`;

            const recipients = await sql<any[]>`
                SELECT id, phone FROM profiles WHERE role IN ('ceo', 'md')
            `;

            if (!recipients) return;

            for (const recipient of recipients) {
                if (recipient.phone) {
                    await sql`
                        INSERT INTO communication_logs (user_id, channel, type, message, status, meta)
                        VALUES (
                            ${recipient.id}, 
                            'sms', 
                            'transactional', 
                            ${message},
                            'pending',
                            ${sql.json({ recipient: recipient.phone })}
                        )
                    `;
                }
            }

        } catch (error) {
            logger.error('AllocationService.notifyAdmins: Error', error);
        }
    }

    async getById(id: string) {
        return await this.allocationRepository.findByIdWithFullDetails(id);
    }

    async getAvailablePlots(estateId: string) {
        return await this.allocationRepository.getAvailablePlots(estateId);
    }

    async getAllWithDetails() {
        return await this.allocationRepository.findAllWithDetails();
    }

    async getPendingApprovals() {
        return await this.allocationRepository.getPendingApprovals();
    }
}
