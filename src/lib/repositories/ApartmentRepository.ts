import sql from '@/lib/db';
import { BaseRepository } from './BaseRepository';
import { IApartmentRepository } from './interfaces/IApartmentRepository';
import { Apartment } from './types';
import { logger } from '@/lib/logger';

export class ApartmentRepository extends BaseRepository<Apartment> implements IApartmentRepository {
    constructor() {
        super('apartments');
    }

    async findAvailable(): Promise<Apartment[]> {
        try {
            const data = await sql<Apartment[]>`
                SELECT * FROM apartments
                WHERE status = 'available'
            `;
            return data;
        } catch (error) {
            logger.error(`ApartmentRepository.findAvailable error`, error);
            throw error;
        }
    }

    async findByLocation(location: string): Promise<Apartment[]> {
        try {
            const data = await sql<Apartment[]>`
                SELECT * FROM apartments
                WHERE location ILIKE ${'%' + location + '%'}
            `;
            return data;
        } catch (error) {
            logger.error(`ApartmentRepository.findByLocation error`, error);
            throw error;
        }
    }

    async updateStatus(id: string, status: Apartment['status']): Promise<Apartment | null> {
        try {
            const [data] = await sql<Apartment[]>`
                UPDATE apartments
                SET status = ${status}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;
            return data || null;
        } catch (error) {
            logger.error(`ApartmentRepository.updateStatus error`, error);
            throw error;
        }
    }

    async getAll(): Promise<Apartment[]> {
        try {
            const data = await sql<Apartment[]>`
                SELECT * FROM apartments
                ORDER BY created_at DESC
            `;
            return data;
        } catch (error) {
            logger.error(`ApartmentRepository.getAll error`, error);
            throw error;
        }
    }
}
