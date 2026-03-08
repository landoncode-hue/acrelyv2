import sql from '@/lib/db';
import { logger } from '@/lib/logger';
import { PlotRepository } from '../repositories/PlotRepository';
import { EstateRepository } from '../repositories/EstateRepository';

export interface CreateEstateParams {
    name: string;
    description?: string;
    location?: string;
    price: number;
    totalPlots: number;
    imageUrls?: string[];
}

export class EstateService {
    private plotRepository: PlotRepository;
    private estateRepository: EstateRepository;

    constructor() {
        this.plotRepository = new PlotRepository();
        this.estateRepository = new EstateRepository();
    }

    async getEstates() {
        return await this.estateRepository.findAll();
    }

    async getPlots(filters: any) {
        return await this.plotRepository.findAll(filters);
    }

    /**
     * Creates an estate and optionally seeds initial plots.
     */
    async createEstate(params: CreateEstateParams, actorId: string) {
        logger.info('EstateService.createEstate: Starting', { params, actorId });

        return await this.estateRepository.createWithPlots({
            name: params.name,
            location: params.location,
            price: params.price,
            totalPlots: params.totalPlots,
            description: params.description || '',
            createdBy: actorId
        });
    }

    /**
     * Updates estate inventory numbers.
     */
    async refreshInventory(estateId: string) {
        const stats = await this.plotRepository.findAll({ estate_id: estateId });

        if (!stats) {
            throw new Error('Plots not found');
        }

        const total = stats.length;
        const occupied = stats.filter(p => p.status === 'sold').length;
        const available = stats.filter(p => p.status === 'available').length;

        return await this.estateRepository.updateInventory(estateId, {
            total,
            occupied,
            available
        });
    }

    async updateEstate(id: string, updates: any) {
        return await this.estateRepository.update(id, updates);
    }

    async archiveEstate(id: string, reason: string) {
        // 1. Validate
        const validation = await this.estateRepository.canArchive(id);
        if (!validation.can_archive) {
            throw new Error(validation.reason);
        }

        // 2. Archive
        return await this.estateRepository.archive(id, reason);
    }

    async checkPlotConflicts(estateId: string, plotNumbers: string[]) {
        const plots = await this.plotRepository.findByNumbers(estateId, plotNumbers);
        return new Set(plots.map(p => p.plot_number));
    }

    async bulkCreatePlots(plots: any[], auditLog: any) {
        const createdPlots = await this.plotRepository.bulkCreate(plots);

        // Audit
        await sql`INSERT INTO audit_logs ${sql(auditLog)}`;

        return createdPlots.length;
    }

    async createPlot(estateId: string, plot: any, auditLog: any) {
        // Check for conflicts
        const conflicts = await this.checkPlotConflicts(estateId, [plot.plot_number]);
        if (conflicts.size > 0) {
            throw new Error(`Plot number ${plot.plot_number} already exists in this estate.`);
        }

        const createdPlot = await this.plotRepository.create({
            ...plot,
            estate_id: estateId
        });

        // Audit
        try {
            await sql`INSERT INTO audit_logs ${sql(auditLog)}`;
        } catch (error) {
            logger.error('EstateService.createPlot: Audit log failed', error);
            // Don't fail the operation just because audit failed, but log it.
        }

        return createdPlot;
    }

    async getById(id: string) {
        return await this.estateRepository.findById(id);
    }

    async getEstateDetails(id: string) {
        const [estate, plots, allocations, analytics] = await Promise.all([
            this.estateRepository.findById(id),
            this.plotRepository.findAll({ estate_id: id }),
            sql<any[]>`
                SELECT 
                    a.*,
                    json_build_object(
                        'id', c.id,
                        'full_name', c.full_name,
                        'phone', c.phone,
                        'email', c.email
                    ) as customers,
                    json_build_object('plot_number', p.plot_number) as plots
                FROM allocations a
                LEFT JOIN customers c ON a.customer_id = c.id
                LEFT JOIN plots p ON a.plot_id = p.id
                WHERE a.estate_id = ${id}
            `,
            this.getEstateAnalytics(id)
        ]);

        return {
            estate,
            plots,
            allocations,
            analytics
        };
    }

    async getEstateAnalytics(estateId: string) {
        try {
            const [result] = await sql<any[]>`
                SELECT * FROM get_estate_analytics(${estateId})
            `;
            return result;
        } catch (error) {
            logger.error('EstateService.getEstateAnalytics error', error);
            return null;
        }
    }
}
