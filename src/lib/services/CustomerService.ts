
import sql from '@/lib/db';
import { logger } from '@/lib/logger';
import { CustomerRepository } from '../repositories/CustomerRepository';

export class CustomerService {
    private customerRepository: CustomerRepository;

    constructor() {
        this.customerRepository = new CustomerRepository();
    }

    async getCustomers() {
        return await this.customerRepository.findAll();
    }

    async getById(id: string) {
        return await this.customerRepository.findById(id);
    }

    async getCustomerByProfileId(profileId: string) {
        return await this.customerRepository.findByProfileId(profileId);
    }

    async updateCustomer(id: string, updates: any) {
        await this.customerRepository.update(id, updates);
        return true;
    }

    async createCustomer(data: any, actorId: string) {
        const conflict = await this.checkConflict(data.email, data.phone);
        if (conflict) {
            throw new Error(`Conflict detected: ${conflict.type} already exists for ${data.email || data.phone}`);
        }

        const payload = {
            ...data,
            created_by: actorId,
            created_at: data.created_at || new Date().toISOString()
        };

        return await this.customerRepository.create(payload);
    }

    async checkConflict(email?: string, phone?: string) {
        if (!email && !phone) return null;

        // 1. Check Customers via Repository
        const existingCustomer = await this.customerRepository.findByEmailOrPhone(email, phone);

        if (existingCustomer) {
            const profiles: any = existingCustomer.profiles;
            const profileName = Array.isArray(profiles) ? profiles[0]?.full_name : profiles?.full_name;
            return {
                found: true,
                type: 'Customer',
                name: existingCustomer.full_name,
                agent: profileName || 'Unknown Agent'
            };
        }

        // 2. Check Leads via direct SQL
        const query = sql`
            SELECT l.full_name, l.created_by, p.full_name as profile_name
            FROM leads l
            LEFT JOIN profiles p ON l.created_by = p.id
            WHERE 1=0
            ${phone ? sql`OR l.phone = ${phone}` : sql``}
            ${email ? sql`OR l.email = ${email}` : sql``}
            LIMIT 1
        `;

        const leads = await query;

        if (leads && leads.length > 0) {
            const match = leads[0];
            return {
                found: true,
                type: 'Lead',
                name: match.full_name,
                agent: match.profile_name || 'Unknown Agent'
            };
        }

        return null;
    }

    async convertLead(leadId: string, actorId: string, actorRole: string, extraData: any) {
        try {
            const [data] = await sql<any[]>`
                SELECT convert_lead_workflow(
                    ${leadId},
                    ${actorId},
                    ${actorRole},
                    ${extraData.email || null},
                    ${extraData.address || null},
                    ${extraData.occupation || null},
                    ${extraData.nextOfKinName || null},
                    ${extraData.nextOfKinPhone || null}
                ) as result
            `;
            return data.result;
        } catch (error: any) {
            logger.error('CustomerService.convertLead error', error);
            throw new Error(error.message);
        }
    }

    async getCustomersWithMetrics() {
        const rawData = await this.customerRepository.findCustomersForMetrics();
        if (!rawData) return [];

        const allPaymentPlanIds: string[] = [];
        rawData.forEach((c: any) => {
            c.allocations?.forEach((a: any) => {
                if (a.payment_plans && Array.isArray(a.payment_plans)) {
                    a.payment_plans.forEach((pp: any) => allPaymentPlanIds.push(pp.id));
                } else if (a.payment_plans?.id) {
                    allPaymentPlanIds.push(a.payment_plans.id);
                }
            });
        });

        const overduePlanIds = new Set<string>();
        if (allPaymentPlanIds.length > 0) {
            const overdueInstallments = await sql`
                SELECT DISTINCT payment_plan_id
                FROM payment_plan_installments
                WHERE payment_plan_id IN (${allPaymentPlanIds})
                AND status = 'pending'
                AND due_date < NOW()
            `;

            if (overdueInstallments) {
                overdueInstallments.forEach((i: any) => overduePlanIds.add(i.payment_plan_id));
            }
        }

        const processed = rawData.map((c: any) => {
            const estateNames = Array.from(new Set(
                c.allocations?.map((a: any) => a.estates?.name).filter(Boolean)
            )).join(", ");

            const totalInvestment = c.allocations?.reduce((sum: number, a: any) =>
                sum + (a.total_price || a.net_price || 0), 0) || 0;

            const totalPaid = c.payments?.reduce((sum: number, p: any) =>
                sum + (p.amount || 0), 0) || 0;

            const outstandingBalance = totalInvestment - totalPaid;

            let hasOverdue = false;
            if (outstandingBalance > 0) {
                c.allocations?.forEach((a: any) => {
                    if (a.payment_plans && Array.isArray(a.payment_plans)) {
                        if (a.payment_plans.some((pp: any) => overduePlanIds.has(pp.id))) hasOverdue = true;
                    } else if (a.payment_plans?.id) {
                        if (overduePlanIds.has(a.payment_plans.id)) hasOverdue = true;
                    }
                });
            }

            return {
                ...c,
                estates: estateNames,
                total_properties: c.allocations?.length || 0,
                total_paid: totalPaid,
                outstanding_balance: outstandingBalance,
                has_overdue: hasOverdue
            };
        });

        return processed;
    }

    async bulkImportCustomers(rows: any[], actorId: string) {
        let successes = 0;
        let failures = 0;
        const errors: string[] = [];

        for (const row of rows) {
            try {
                const email = row.email?.trim();
                const phone = row.phone?.trim();
                const fullName = row.full_name?.trim() || row.name?.trim();

                if (!email && !phone) {
                    throw new Error(`Row missing email/phone`);
                }

                const existing = await this.customerRepository.findByEmail(email);

                if (existing) {
                    await this.customerRepository.update(existing.id, {
                        full_name: fullName,
                        phone: phone || undefined,
                        address: row.address,
                        status: row.status || undefined
                    });
                } else {
                    await this.customerRepository.create({
                        full_name: fullName || 'Unknown',
                        email: email,
                        phone: phone,
                        address: row.address,
                        status: row.status || 'active',
                        created_by: actorId,
                        kyc_status: 'not_started'
                    });
                }
                successes++;
            } catch (e: any) {
                failures++;
                errors.push(e.message);
            }
        }

        await sql`
            INSERT INTO audit_logs (actor_user_id, action_type, target_type, changes)
            VALUES (${actorId}, 'bulk_import_customers', 'system', ${sql.json({ count: rows.length, successes, failures })})
        `;

        return { success: true, successes, failures, errors };
    }

    async submitKycData(customerId: string, data: any) {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) throw new Error("Customer record not found");

        const updatedKycData = {
            ...(customer.kyc_data || {}),
            ...data,
            submitted_at: new Date().toISOString(),
            verified_at: null,
            rejection_reason: null
        };

        await this.customerRepository.update(customerId, {
            kyc_status: 'pending',
            kyc_data: updatedKycData
        });

        return true;
    }

    async verifyKyc(customerId: string, action: 'verify' | 'reject', actorId: string, reason?: string) {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) throw new Error("Customer not found");

        const updatedKycData = {
            ...(customer.kyc_data || {}),
            verified_at: action === 'verify' ? new Date().toISOString() : null,
            rejection_reason: action === 'reject' ? reason : null,
            verified_by: actorId
        };

        await this.customerRepository.update(customerId, {
            kyc_status: action === 'verify' ? 'verified' : 'rejected',
            kyc_data: updatedKycData
        });

        await sql`
            INSERT INTO audit_logs (actor_user_id, action_type, target_id, target_type, changes)
            VALUES (${actorId}, ${`kyc.${action}`}, ${customerId}, 'customers', ${sql.json({ reason })})
        `;

        return true;
    }

    async getKycRequests() {
        return await this.customerRepository.findKycRequests();
    }

    async getCustomerDetails(id: string) {
        return await this.customerRepository.findByIdWithDetails(id);
    }

    async addNote(customerId: string, content: string, authorId: string) {
        try {
            const [data] = await sql<any[]>`
                WITH inserted AS (
                    INSERT INTO customer_notes (customer_id, content, author_id)
                    VALUES (${customerId}, ${content}, ${authorId})
                    RETURNING *
                )
                SELECT i.*, json_build_object('full_name', p.full_name) as author
                FROM inserted i
                LEFT JOIN profiles p ON i.author_id = p.id
            `;
            return data;
        } catch (error) {
            logger.error('CustomerService.addNote error', error);
            throw error;
        }
    }

    async updateKYCStatus(customerId: string, status: any, notes: string, actorId: string, actorRole: string) {
        try {
            await sql`
                SELECT update_kyc_workflow(
                    ${customerId},
                    ${status},
                    ${notes || null},
                    ${actorId},
                    ${actorRole}
                )
            `;
            return true;
        } catch (error: any) {
            logger.error('CustomerService.updateKYCStatus error', error);
            throw new Error(error.message);
        }
    }

    async deleteCustomer(id: string) {
        return await this.customerRepository.delete(id);
    }
}

