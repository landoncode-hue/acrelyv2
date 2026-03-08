import { BaseRepository } from './BaseRepository';
import { Profile } from './types';
import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class ProfileRepository extends BaseRepository<Profile> {
    constructor() {
        super('profiles');
    }

    async findByEmail(email: string): Promise<Profile | null> {
        try {
            const data = await sql<Profile[]>`
                SELECT * FROM profiles
                WHERE LOWER(email) = LOWER(${email})
            `;
            return data[0] || null;
        } catch (error) {
            logger.error('ProfileRepository.findByEmail error', error);
            return null;
        }
    }

    async findStaff(filters?: { role?: string; status?: string }): Promise<Profile[]> {
        try {
            let query = sql`SELECT * FROM profiles WHERE is_staff = true`;

            if (filters?.role && filters.role !== 'all') {
                query = sql`${query} AND role = ${filters.role}`;
            }

            if (filters?.status && filters.status !== 'all') {
                query = sql`${query} AND staff_status = ${filters.status}`;
            }

            query = sql`${query} ORDER BY created_at DESC`;

            const data = await query;
            return data as unknown as Profile[];
        } catch (error) {
            logger.error('ProfileRepository.findStaff error', error);
            throw error;
        }
    }
}
