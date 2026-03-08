"use server";

import { safeAction } from "@/lib/safe-action";
import { CustomerService } from "@/lib/services/CustomerService";
import { SupportService } from "@/lib/services/SupportService";
import { PaymentService } from "@/lib/services/PaymentService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Portal Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const customerService = new CustomerService();
const supportService = new SupportService();
const paymentService = new PaymentService();

const updateCustomerSchema = z.object({
    phone: z.string(),
    address: z.string(),
    next_of_kin_name: z.string(),
    next_of_kin_phone: z.string()
});

const createTicketSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required")
});

export const updateCustomerAction = async (input: z.infer<typeof updateCustomerSchema>) => {
    return safeAction("updateCustomer", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const customer = await customerService.getCustomerByProfileId(user.id);
        if (!customer) throw new Error("Customer profile not found");

        await customerService.updateCustomer(customer.id, input);

        revalidatePath("/portal/settings");
        return { success: true };
    });
};

export const createTicketAction = async (input: z.infer<typeof createTicketSchema>) => {
    return safeAction("createTicket", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const customer = await customerService.getCustomerByProfileId(user.id);
        const customerId = customer?.id;

        await supportService.createTicket({
            userId: user.id,
            customerId: customerId,
            subject: input.subject,
            message: input.message
        });

        revalidatePath("/portal/help");
        return { success: true };
    });
};

export const getPortalDocumentsAction = async () => {
    return safeAction("getPortalDocuments", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const customer = await customerService.getCustomerByProfileId(user.id);
        if (!customer) throw new Error("Customer profile not found");

        const payments = await paymentService.getPaymentsByCustomerId(customer.id);

        return payments
            .filter((p: any) => p.status === 'verified')
            .map((p: any) => ({
                id: p.id,
                type: 'receipt' as const,
                title: `Payment Receipt #${p.transaction_ref}`,
                description: `Receipt for ₦${p.amount?.toLocaleString()} via ${p.method?.replace('_', ' ')}`,
                date: p.payment_date,
                downloadPath: `${p.id}/receipt-${p.transaction_ref}.pdf`,
                status: p.status,
                allocation_id: p.allocation_id,
            }));
    });
};
