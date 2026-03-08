import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export class ProfileService {
    constructor() { }

    async updateAvatar(userId: string, avatarUrl: string) {
        try {
            await sql`
                UPDATE profiles 
                SET avatar_url = ${avatarUrl}
                WHERE id = ${userId}
            `;
            return true;
        } catch (error) {
            logger.error('ProfileService.updateAvatar error', error);
            throw error;
        }
    }

    async updatePassword(userId: string, passwordHash: string) {
        try {
            await sql`
                UPDATE profiles 
                SET password_hash = ${passwordHash}, updated_at = NOW()
                WHERE id = ${userId}
            `;
            return true;
        } catch (error) {
            logger.error('ProfileService.updatePassword error', error);
            throw error;
        }
    }

    async updateProfile(userId: string, updates: any) {
        try {
            await sql`
                UPDATE profiles 
                SET ${sql(updates)}
                WHERE id = ${userId}
            `;
            return true;
        } catch (error) {
            logger.error('ProfileService.updateProfile error', error);
            throw error;
        }
    }

    async getAgents() {
        try {
            const data = await sql`
                SELECT id, full_name, role 
                FROM profiles
                WHERE role IN ('agent', 'sales', 'staff') OR is_staff = true
                ORDER BY full_name
            `;
            return data;
        } catch (error) {
            logger.error('ProfileService.getAgents error', error);
            throw error;
        }
    }

    async getProfile(userId: string) {
        try {
            const [profile] = await sql<any[]>`
                SELECT * 
                FROM profiles
                WHERE id = ${userId}
            `;
            return profile;
        } catch (error) {
            logger.error('ProfileService.getProfile error', error);
            throw error;
        }
    }
}
