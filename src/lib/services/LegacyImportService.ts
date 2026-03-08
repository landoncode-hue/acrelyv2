import sql from '@/lib/db';
import { logger } from '@/lib/logger';
import { normalizePhone } from "@/lib/utils/phone";

export type LegacyImportData = {
    customer: {
        full_name: string;
        email: string;
        address: string;
        occupation: string;
        next_of_kin_name: string;
        next_of_kin_phone: string;
    };
    phoneNumbers: {
        number: string;
        label: string;
        isPrimary: boolean;
    }[];
    plot: {
        estate_id: string;
        plot_number: string;
        dimensions: string;
        is_half_plot: boolean;
        half_plot_designation: "" | "A" | "B" | null;
    };
    payment: {
        amount_paid: string;
        balance: string;
        payment_date: string;
        payment_method: string;
        transaction_ref: string;
    };
};

export class LegacyImportService {
    constructor() { }

    /**
     * Imports legacy data into the system.
     * This operation is complex and should ideally be wrapped in a transaction.
     */
    async importLegacyData(data: LegacyImportData, actorId: string) {
        logger.info('LegacyImportService.importLegacyData: Starting', { data, actorId });

        return await sql.begin(async (sql) => {
            // 1. Customer Management
            const primaryPhoneObj = data.phoneNumbers.find(p => p.isPrimary) || data.phoneNumbers[0];
            const normalizedPrimaryPhone = normalizePhone(primaryPhoneObj.number);

            if (!normalizedPrimaryPhone) {
                throw new Error("Invalid primary phone number");
            }

            // Check if customer exists
            let customerId: string;
            const existingCustomers = await sql`
                SELECT id FROM customers WHERE phone = ${normalizedPrimaryPhone} LIMIT 1
            `;

            if (existingCustomers.length > 0) {
                customerId = existingCustomers[0].id;
            } else {
                const [newCustomer] = await sql`
                    INSERT INTO customers (
                        full_name,
                        email,
                        phone,
                        address,
                        occupation,
                        next_of_kin_name,
                        next_of_kin_phone,
                        created_by
                    ) VALUES (
                        ${data.customer.full_name.trim()},
                        ${data.customer.email.trim() || null},
                        ${normalizedPrimaryPhone},
                        ${data.customer.address.trim() || null},
                        ${data.customer.occupation.trim() || null},
                        ${data.customer.next_of_kin_name.trim() || null},
                        ${data.customer.next_of_kin_phone.trim() || null},
                        ${actorId}
                    )
                    RETURNING id
                `;
                customerId = newCustomer.id;
            }

            // 2. Additional Phone Numbers
            const additionalPhones = data.phoneNumbers
                .filter(p => normalizePhone(p.number) !== normalizedPrimaryPhone)
                .map(p => ({
                    customer_id: customerId,
                    phone_number: normalizePhone(p.number),
                    is_primary: false,
                    label: p.label || "Additional"
                }));

            if (additionalPhones.length > 0) {
                await sql`
                    INSERT INTO customer_phone_numbers ${sql(additionalPhones)}
                `;
            }

            // 3. Plot Management
            let plotId: string;
            const existingPlots = await sql`
                SELECT id, status, customer_id 
                FROM plots 
                WHERE estate_id = ${data.plot.estate_id} 
                AND plot_number = ${data.plot.plot_number.trim()} 
                LIMIT 1
            `;

            if (existingPlots.length > 0) {
                const existingPlot = existingPlots[0];
                await sql`
                    UPDATE plots 
                    SET 
                        is_half_plot = ${data.plot.is_half_plot},
                        half_plot_designation = ${data.plot.is_half_plot ? data.plot.half_plot_designation : null},
                        dimensions = ${data.plot.dimensions.trim() || null}
                    WHERE id = ${existingPlot.id}
                `;
                plotId = existingPlot.id;
            } else {
                const [newPlot] = await sql`
                    INSERT INTO plots (
                        estate_id,
                        plot_number,
                        status,
                        customer_id,
                        dimensions,
                        is_half_plot,
                        half_plot_designation
                    ) VALUES (
                        ${data.plot.estate_id},
                        ${data.plot.plot_number.trim()},
                        'available',
                        null,
                        ${data.plot.dimensions.trim() || null},
                        ${data.plot.is_half_plot},
                        ${data.plot.is_half_plot ? data.plot.half_plot_designation : null}
                    )
                    RETURNING id
                `;
                plotId = newPlot.id;
            }

            // 4. Allocation
            const [allocation] = await sql`
                INSERT INTO allocations (
                    customer_id,
                    plot_id,
                    estate_id,
                    status,
                    allocation_date,
                    drafted_by,
                    approved_by,
                    notes,
                    plot_half,
                    customer_facing_name
                ) VALUES (
                    ${customerId},
                    ${plotId},
                    ${data.plot.estate_id},
                    'completed',
                    ${data.payment.payment_date},
                    ${actorId},
                    ${actorId},
                    'Imported via Legacy Data Entry',
                    ${data.plot.is_half_plot ? data.plot.half_plot_designation : null},
                    ${data.plot.is_half_plot
                    ? `${data.plot.plot_number}${data.plot.half_plot_designation}`
                    : data.plot.plot_number}
                )
                RETURNING id
            `;

            const unitPrice = parseFloat(data.payment.amount_paid || "0") + parseFloat(data.payment.balance || "0");
            await sql`
                INSERT INTO allocation_plots (
                    allocation_id,
                    plot_id,
                    plot_half,
                    unit_price
                ) VALUES (
                    ${allocation.id},
                    ${plotId},
                    ${data.plot.is_half_plot ? data.plot.half_plot_designation : null},
                    ${unitPrice}
                )
            `;

            // 5. Final Status Sync
            const plotUpdateData: any = {
                status: 'sold',
                customer_id: customerId
            };

            if (data.plot.is_half_plot) {
                if (data.plot.half_plot_designation === 'A') {
                    plotUpdateData.half_a_allocation_id = allocation.id;
                } else if (data.plot.half_plot_designation === 'B') {
                    plotUpdateData.half_b_allocation_id = allocation.id;
                }
            }

            await sql`
                UPDATE plots 
                SET ${sql(plotUpdateData)}
                WHERE id = ${plotId}
            `;

            // 6. Payments
            const amountPaid = parseFloat(data.payment.amount_paid || "0");
            if (amountPaid > 0) {
                await sql`
                    INSERT INTO payments (
                        customer_id,
                        allocation_id,
                        amount,
                        method,
                        transaction_ref,
                        payment_date,
                        status,
                        recorded_by,
                        portal_visible
                    ) VALUES (
                        ${customerId},
                        ${allocation.id},
                        ${amountPaid},
                        ${data.payment.payment_method},
                        ${data.payment.transaction_ref.trim() || `LEGACY-${Date.now()}`},
                        ${data.payment.payment_date},
                        'verified',
                        ${actorId},
                        true
                    )
                `;
            }

            // 7. Payment Plan
            const balance = parseFloat(data.payment.balance || "0");
            if (balance > 0) {
                const totalAmount = amountPaid + balance;
                await sql`
                    INSERT INTO payment_plans (
                        allocation_id,
                        plan_type,
                        total_amount,
                        start_date,
                        duration_months,
                        status,
                        name
                    ) VALUES (
                        ${allocation.id},
                        'custom',
                        ${totalAmount},
                        ${data.payment.payment_date},
                        12,
                        'active',
                        'Legacy Payment Plan'
                    )
                `;
            }

            return customerId;
        });
    }
}
