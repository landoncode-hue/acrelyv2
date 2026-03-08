import sql from '@/lib/db';
import { BaseRepository } from './BaseRepository';
import { IEstateRepository } from './interfaces/IEstateRepository';
import { Estate } from './types';
import { logger } from '@/lib/logger';

export class EstateRepository extends BaseRepository<Estate> implements IEstateRepository {
    constructor() {
        super('estates');
    }

    async createWithPlots(params: {
        name: string;
        location?: string;
        price: number;
        totalPlots: number;
        description?: string;
        createdBy: string;
    }): Promise<string> {
        try {
            const [data] = await sql<any[]>`
                SELECT create_estate_with_plots(
                    ${params.name},
                    ${params.location || null},
                    ${params.price},
                    ${params.totalPlots},
                    ${params.description || ''},
                    ${params.createdBy}
                ) as id
            `;
            return data.id;
        } catch (error) {
            logger.error(`EstateRepository.createWithPlots error`, error);
            throw error;
        }
    }

    async updateInventory(estateId: string, totals: {
        total: number;
        occupied: number;
        available: number;
    }): Promise<boolean> {
        try {
            await sql`
                UPDATE estates
                SET 
                    total_plots = ${totals.total},
                    occupied_plots = ${totals.occupied},
                    available_plots = ${totals.available},
                    updated_at = NOW()
                WHERE id = ${estateId}
            `;
            return true;
        } catch (error) {
            logger.error(`EstateRepository.updateInventory error`, error);
            throw error;
        }
    }

    async canArchive(id: string): Promise<{ can_archive: boolean; reason?: string }> {
        try {
            const [data] = await sql<any[]>`
                SELECT can_archive, reason FROM can_archive_estate(${id})
            `;
            return data;
        } catch (error) {
            logger.error(`EstateRepository.canArchive error`, error);
            throw error;
        }
    }

    async archive(id: string, reason: string): Promise<boolean> {
        try {
            await sql`
                UPDATE estates
                SET 
                    status = 'archived',
                    archived_at = NOW(),
                    archive_reason = ${reason},
                    updated_at = NOW()
                WHERE id = ${id}
            `;
            return true;
        } catch (error) {
            logger.error(`EstateRepository.archive error`, error);
            throw error;
        }
    }
}
