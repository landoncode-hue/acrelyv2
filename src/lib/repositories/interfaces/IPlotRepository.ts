import { IRepository } from './IRepository';
import { Plot } from '../types';

export interface IPlotRepository extends IRepository<Plot> {
    findAvailablePlots(estateId: string): Promise<Plot[]>;
    findByNumbers(estateId: string, plotNumbers: string[]): Promise<Plot[]>;
    markAsReserved(id: string): Promise<void>;
    markAsSold(id: string): Promise<void>;
    markAsAvailable(id: string): Promise<void>;
}
