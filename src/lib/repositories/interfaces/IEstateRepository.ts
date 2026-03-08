import { IRepository } from './IRepository';
import { Estate } from '../types';

export interface IEstateRepository extends IRepository<Estate> {
    createWithPlots(params: {
        name: string;
        location?: string;
        price: number;
        totalPlots: number;
        description?: string;
        createdBy: string;
    }): Promise<string>;

    updateInventory(estateId: string, totals: {
        total: number;
        occupied: number;
        available: number;
    }): Promise<boolean>;

    canArchive(id: string): Promise<{ can_archive: boolean; reason?: string }>;

    archive(id: string, reason: string): Promise<boolean>;
}
