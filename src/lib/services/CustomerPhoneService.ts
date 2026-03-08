import sql from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CustomerPhoneNumber {
    id: string;
    customer_id: string;
    phone_number: string;
    label: string;
    is_primary: boolean;
    created_at: string;
}

export class CustomerPhoneService {
    constructor() { }

    async getPhoneNumbers(customerId: string): Promise<CustomerPhoneNumber[]> {
        try {
            return await sql<CustomerPhoneNumber[]>`
                SELECT * FROM customer_phone_numbers 
                WHERE customer_id = ${customerId}
                ORDER BY is_primary DESC, created_at ASC
            `;
        } catch (error) {
            logger.error('CustomerPhoneService.getPhoneNumbers error', error);
            throw error;
        }
    }

    async addPhoneNumber(customerId: string, phoneNumber: string, label: string = "Additional", isPrimary: boolean = false) {
        try {
            return await sql.begin(async (sql) => {
                if (isPrimary) {
                    await sql`
                        UPDATE customer_phone_numbers 
                        SET is_primary = false 
                        WHERE customer_id = ${customerId}
                    `;
                }

                const [data] = await sql<CustomerPhoneNumber[]>`
                    INSERT INTO customer_phone_numbers (customer_id, phone_number, label, is_primary)
                    VALUES (${customerId}, ${phoneNumber}, ${label}, ${isPrimary})
                    RETURNING *
                `;
                return data;
            });
        } catch (error) {
            logger.error('CustomerPhoneService.addPhoneNumber error', error);
            throw error;
        }
    }

    async updatePhoneNumber(phoneId: string, updates: Partial<Pick<CustomerPhoneNumber, "phone_number" | "label" | "is_primary">>) {
        try {
            return await sql.begin(async (sql) => {
                // If setting as primary, get customer_id first to unset others
                if (updates.is_primary) {
                    const [phone] = await sql`
                        SELECT customer_id FROM customer_phone_numbers WHERE id = ${phoneId}
                    `;
                    if (phone) {
                        await sql`
                            UPDATE customer_phone_numbers 
                            SET is_primary = false 
                            WHERE customer_id = ${phone.customer_id}
                        `;
                    }
                }

                await sql`
                    UPDATE customer_phone_numbers 
                    SET ${sql(updates)} 
                    WHERE id = ${phoneId}
                `;
                return true;
            });
        } catch (error) {
            logger.error('CustomerPhoneService.updatePhoneNumber error', error);
            throw error;
        }
    }

    async deletePhoneNumber(phoneId: string) {
        try {
            const [phone] = await sql`
                SELECT customer_id FROM customer_phone_numbers WHERE id = ${phoneId}
            `;

            await sql`DELETE FROM customer_phone_numbers WHERE id = ${phoneId}`;

            return phone?.customer_id;
        } catch (error) {
            logger.error('CustomerPhoneService.deletePhoneNumber error', error);
            throw error;
        }
    }

    async setPrimary(phoneId: string, customerId: string) {
        try {
            return await sql.begin(async (sql) => {
                await sql`
                    UPDATE customer_phone_numbers 
                    SET is_primary = false 
                    WHERE customer_id = ${customerId}
                `;
                await sql`
                    UPDATE customer_phone_numbers 
                    SET is_primary = true 
                    WHERE id = ${phoneId}
                `;
                return true;
            });
        } catch (error) {
            logger.error('CustomerPhoneService.setPrimary error', error);
            throw error;
        }
    }

    async getPrimaryNumber(customerId: string): Promise<string | null> {
        try {
            const [phone] = await sql`
                SELECT phone_number FROM customer_phone_numbers 
                WHERE customer_id = ${customerId} AND is_primary = true
            `;

            if (phone) return phone.phone_number;

            // Fallback to customer table
            const [customer] = await sql`
                SELECT phone FROM customers WHERE id = ${customerId}
            `;
            return customer?.phone || null;
        } catch (error) {
            logger.error('CustomerPhoneService.getPrimaryNumber error', error);
            throw error;
        }
    }
}
