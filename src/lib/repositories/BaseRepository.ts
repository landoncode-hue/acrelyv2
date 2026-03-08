import sql from '@/lib/db';
import { IRepository } from './interfaces/IRepository';
import { logger } from '@/lib/logger';

export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
    protected tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    async findById(id: string): Promise<T | null> {
        try {
            const data = await sql<T[]>`
                SELECT * FROM ${sql(this.tableName)}
                WHERE id = ${id}
            `;
            return (data[0] as unknown as T) || null;
        } catch (error) {
            logger.error(`BaseRepository.findById error in ${this.tableName}`, error);
            return null;
        }
    }

    async findAll(filter?: Partial<T>): Promise<T[]> {
        try {
            let query = sql`SELECT * FROM ${sql(this.tableName)}`;

            if (filter && Object.keys(filter).length > 0) {
                const entries = Object.entries(filter);
                const conditions = entries.map(([key, value], i) =>
                    sql`${i > 0 ? sql`AND` : sql``} ${sql(key)} = ${value}`
                );
                query = sql`${query} WHERE ${conditions}`;
            }

            const data = await query;
            return data as unknown as T[];
        } catch (error) {
            logger.error(`BaseRepository.findAll error in ${this.tableName}`, error);
            throw error;
        }
    }

    async create(data: Partial<T>): Promise<T> {
        try {
            const [created] = await sql<T[]>`
                INSERT INTO ${sql(this.tableName)} ${sql(data as any)}
                RETURNING *
            `;
            return created as unknown as T;
        } catch (error) {
            logger.error(`BaseRepository.create error in ${this.tableName}`, error);
            throw error;
        }
    }

    async bulkCreate(data: Partial<T>[]): Promise<T[]> {
        try {
            const created = await sql<T[]>`
                INSERT INTO ${sql(this.tableName)} ${sql(data as any)}
                RETURNING *
            `;
            return created as unknown as T[];
        } catch (error) {
            logger.error(`BaseRepository.bulkCreate error in ${this.tableName}`, error);
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        try {
            const [updated] = await sql<T[]>`
                UPDATE ${sql(this.tableName)}
                SET ${sql(data as any)}
                WHERE id = ${id}
                RETURNING *
            `;
            return updated as unknown as T;
        } catch (error) {
            logger.error(`BaseRepository.update error in ${this.tableName}`, error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await sql`
                DELETE FROM ${sql(this.tableName)}
                WHERE id = ${id}
            `;
            return true;
        } catch (error) {
            logger.error(`BaseRepository.delete error in ${this.tableName}`, error);
            throw error;
        }
    }
}
