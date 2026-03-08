import sql from '@/lib/db';
import { BaseRepository } from './BaseRepository';
import { IPlotRepository } from './interfaces/IPlotRepository';
import { Plot } from './types';
import { logger } from '@/lib/logger';

export class PlotRepository extends BaseRepository<Plot> implements IPlotRepository {
    constructor() {
        super('plots');
    }

    async findAvailablePlots(estateId: string): Promise<Plot[]> {
        try {
            const data = await sql<Plot[]>`
                SELECT * FROM plots
                WHERE estate_id = ${estateId} AND status = 'available'
            `;
            return data;
        } catch (error) {
            logger.error(`PlotRepository.findAvailablePlots error`, error);
            throw error;
        }
    }

    async findByNumbers(estateId: string, plotNumbers: string[]): Promise<Plot[]> {
        try {
            const data = await sql<Plot[]>`
                SELECT * FROM plots
                WHERE estate_id = ${estateId}
                AND plot_number IN (${plotNumbers})
            `;
            return data;
        } catch (error) {
            logger.error(`PlotRepository.findByNumbers error`, error);
            throw error;
        }
    }

    async markAsReserved(id: string): Promise<void> {
        try {
            await sql`
                UPDATE plots
                SET status = 'reserved', updated_at = NOW()
                WHERE id = ${id}
            `;
        } catch (error) {
            logger.error(`PlotRepository.markAsReserved error`, error);
            throw error;
        }
    }

    async markAsSold(id: string): Promise<void> {
        try {
            await sql`
                UPDATE plots
                SET status = 'sold', updated_at = NOW()
                WHERE id = ${id}
            `;
        } catch (error) {
            logger.error(`PlotRepository.markAsSold error`, error);
            throw error;
        }
    }

    async markAsAvailable(id: string): Promise<void> {
        try {
            await sql`
                UPDATE plots
                SET status = 'available', updated_at = NOW()
                WHERE id = ${id}
            `;
        } catch (error) {
            logger.error(`PlotRepository.markAsAvailable error`, error);
            throw error;
        }
    }
}
