import sql from '@/lib/db';
import { BaseRepository } from './BaseRepository';
import { ICustomerRepository } from './interfaces/ICustomerRepository';
import { Customer } from './types';
import { logger } from '@/lib/logger';

export class CustomerRepository extends BaseRepository<Customer> implements ICustomerRepository {
    constructor() {
        super('customers');
    }

    async findByEmail(email: string): Promise<Customer | null> {
        try {
            const [data] = await sql<Customer[]>`
                SELECT * FROM customers
                WHERE email = ${email}
            `;
            return data || null;
        } catch (error) {
            logger.error('CustomerRepository.findByEmail error', error);
            throw error;
        }
    }

    async findByPhone(phone: string): Promise<Customer | null> {
        try {
            const [data] = await sql<Customer[]>`
                SELECT * FROM customers
                WHERE phone = ${phone}
            `;
            return data || null;
        } catch (error) {
            logger.error('CustomerRepository.findByPhone error', error);
            throw error;
        }
    }

    async findByProfileId(profileId: string): Promise<Customer | null> {
        try {
            const [data] = await sql<Customer[]>`
                SELECT * FROM customers
                WHERE profile_id = ${profileId}
            `;
            return data || null;
        } catch (error) {
            logger.error('CustomerRepository.findByProfileId error', error);
            throw error;
        }
    }

    async findByEmailOrPhone(email?: string, phone?: string): Promise<any | null> {
        if (!email && !phone) return null;

        try {
            const [data] = await sql<any[]>`
                SELECT 
                    c.full_name, 
                    c.created_by, 
                    p.full_name as profile_full_name
                FROM customers c
                LEFT JOIN profiles p ON c.created_by = p.id
                WHERE (
                    (${phone ? sql`c.phone = ${phone}` : sql`FALSE`})
                    OR 
                    (${email ? sql`c.email = ${email}` : sql`FALSE`})
                )
                LIMIT 1
            `;

            if (!data) return null;

            // Transform back to match expected shape if needed
            return {
                full_name: data.fullName,
                created_by: data.createdBy,
                profiles: {
                    full_name: data.profileFullName
                }
            };
        } catch (error) {
            logger.error('CustomerRepository.findByEmailOrPhone error', error);
            throw error;
        }
    }

    async findKycRequests(): Promise<Customer[]> {
        try {
            const data = await sql<Customer[]>`
                SELECT * FROM customers
                WHERE kyc_status IN ('pending', 'verified', 'rejected')
                ORDER BY updated_at DESC
            `;
            return data;
        } catch (error) {
            logger.error('CustomerRepository.findKycRequests error', error);
            throw error;
        }
    }

    async findByIdWithDetails(id: string): Promise<any> {
        try {
            const [customer] = await sql<any[]>`SELECT * FROM customers WHERE id = ${id}`;
            if (!customer) return null;

            const [allocations, payments, interactions, documents, notes] = await Promise.all([
                sql`
                    SELECT a.*, e.name as estate_name, p.plot_number
                    FROM allocations a
                    LEFT JOIN estates e ON a.estate_id = e.id
                    LEFT JOIN plots p ON a.plot_id = p.id
                    WHERE a.customer_id = ${id}
                `,
                sql`
                    SELECT py.*, pr.full_name as recorded_by_user_full_name
                    FROM payments py
                    LEFT JOIN profiles pr ON py.recorded_by = pr.id
                    WHERE py.customer_id = ${id}
                    ORDER BY py.payment_date DESC
                `,
                sql`
                    SELECT i.*, pr.full_name as author_full_name
                    FROM interaction_logs i
                    LEFT JOIN profiles pr ON i.created_by = pr.id
                    WHERE i.customer_id = ${id}
                    ORDER BY i.created_at DESC
                `,
                sql`
                    SELECT d.*, pr.full_name as created_by_user_full_name
                    FROM documents d
                    LEFT JOIN profiles pr ON d.created_by = pr.id
                    WHERE d.customer_id = ${id}
                    ORDER BY d.created_at DESC
                `,
                sql`
                    SELECT n.*, pr.full_name as author_full_name
                    FROM customer_notes n
                    LEFT JOIN profiles pr ON n.author_id = pr.id
                    WHERE n.customer_id = ${id}
                    ORDER BY n.created_at DESC
                `
            ]);

            return {
                customer,
                allocations: (allocations as any[]).map(a => ({
                    ...a,
                    estates: { name: a.estateName },
                    plots: { plot_number: a.plotNumber }
                })),
                payments: (payments as any[]).map(p => ({
                    ...p,
                    recorded_by_user: { full_name: p.recordedByUserFullName }
                })),
                interactions: (interactions as any[]).map(i => ({
                    ...i,
                    author: { full_name: i.authorFullName }
                })),
                documents: (documents as any[]).map(d => ({
                    ...d,
                    created_by_user: { full_name: d.createdByUserFullName }
                })),
                notes: (notes as any[]).map(n => ({
                    ...n,
                    author: { full_name: n.authorFullName }
                }))
            };
        } catch (error) {
            logger.error('CustomerRepository.findByIdWithDetails error', error);
            throw error;
        }
    }

    async findCustomersForMetrics(): Promise<any[]> {
        try {
            // Using a single query with subqueries or joins might be complex for the expected nested structure.
            // Let's use a join approach and manually group, or fetch separately if performance allows.
            // Given the original code, it was fetching everything for metrics.

            const customers = await sql<any[]>`
                SELECT 
                    c.*,
                    (
                        SELECT json_agg(json_build_object(
                            'id', a.id,
                            'net_price', a.net_price,
                            'total_price', a.total_price,
                            'estates', json_build_object('name', e.name),
                            'payment_plans', json_build_object('id', a.payment_plan_id)
                        ))
                        FROM allocations a
                        LEFT JOIN estates e ON a.estate_id = e.id
                        WHERE a.customer_id = c.id
                    ) as allocations,
                    (
                        SELECT json_agg(json_build_object('amount', p.amount))
                        FROM payments p
                        WHERE p.customer_id = c.id
                    ) as payments
                FROM customers c
                ORDER BY c.created_at DESC
            `;

            return customers.map(c => ({
                ...c,
                allocations: c.allocations || [],
                payments: c.payments || []
            }));
        } catch (error) {
            logger.error('CustomerRepository.findCustomersForMetrics error', error);
            throw error;
        }
    }
}
