import { IRepository } from './IRepository';
import { Apartment } from '../types';

export interface IApartmentRepository extends IRepository<Apartment> {
    findAvailable(): Promise<Apartment[]>;
    findByLocation(location: string): Promise<Apartment[]>;
    updateStatus(id: string, status: Apartment['status']): Promise<Apartment | null>;
    getAll(): Promise<Apartment[]>;
}
