"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CustomerService } from "@/lib/services/CustomerService";
import { CommunicationService } from "@/lib/services/CommunicationService";
import { ProfileService } from "@/lib/services/ProfileService";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Customer Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const customerService = new CustomerService();
const communicationService = new CommunicationService();
const profileService = new ProfileService();

const createCustomerSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    occupation: z.string().optional(),
    next_of_kin_name: z.string().optional(),
    next_of_kin_phone: z.string().optional(),
    joined_at: z.string().optional().transform(e => e === "" ? undefined : e),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const createCustomerAction = async (input: CreateCustomerInput) => {
    return safeAction('createCustomer', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        return await customerService.createCustomer(input, user.id);
    });
};

export const getCustomersAction = async () => {
    return safeAction('getCustomers', async () => {
        return await customerService.getCustomers();
    });
};

export const checkCustomerConflictAction = async (email?: string, phone?: string) => {
    return safeAction('checkCustomerConflict', async () => {
        return customerService.checkConflict(email, phone);
    });
};

const convertLeadSchema = z.object({
    leadId: z.string(),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
    occupation: z.string().optional(),
    nextOfKinName: z.string().optional(),
    nextOfKinPhone: z.string().optional(),
});

export const convertLeadAction = async (input: z.infer<typeof convertLeadSchema>) => {
    return safeAction('convertLead', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const profile = await profileService.getProfile(user.id);
        const role = profile?.role || 'staff';

        const customer = await customerService.convertLead(input.leadId, user.id, role, input);

        revalidatePath("/dashboard/leads");
        revalidatePath("/dashboard/customers");
        return customer;
    });
};

export const bulkImportCustomersAction = async (rows: any[]) => {
    return safeAction('bulkImportCustomers', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        let successes = 0;
        let failures = 0;
        const errors: string[] = [];

        for (const row of rows) {
            try {
                const input: CreateCustomerInput = {
                    full_name: row.full_name,
                    phone: row.phone,
                    email: row.email || "",
                    address: row.address,
                    occupation: row.occupation,
                    next_of_kin_name: row.next_of_kin_name,
                    next_of_kin_phone: row.next_of_kin_phone,
                    joined_at: row.joined_at,
                };

                const valid = createCustomerSchema.safeParse(input);
                if (!valid.success) {
                    throw new Error(`Invalid data for ${row.email || row.phone}: ${valid.error.issues.map(i => i.message).join(', ')}`);
                }

                await customerService.createCustomer(valid.data, user.id);
                successes++;
            } catch (e: any) {
                failures++;
                errors.push(e.message);
            }
        }

        revalidatePath("/dashboard/customers");
        return { successes, failures, errors };
    });
};

const updateCustomerKYCSchema = z.object({
    customerId: z.string(),
    status: z.enum(['pending', 'verified', 'rejected']),
    notes: z.string().optional()
});

export const updateCustomerKYCAction = async (data: z.infer<typeof updateCustomerKYCSchema>) => {
    return safeAction('updateCustomerKYC', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const profile = await profileService.getProfile(user.id);
        const role = profile?.role || 'staff';

        await customerService.updateKYCStatus(
            data.customerId,
            data.status,
            data.notes || "",
            user.id,
            role
        );

        revalidatePath(`/dashboard/customers/${data.customerId}`);
        revalidatePath('/dashboard/customers');
        return true;
    });
};

export const updateCustomerAction = async (id: string, updates: any) => {
    return safeAction('updateCustomer', async () => {
        await customerService.updateCustomer(id, updates);

        revalidatePath(`/dashboard/customers/${id}`);
        return true;
    });
};

export const addCustomerNoteAction = async (customerId: string, content: string) => {
    return safeAction('addCustomerNote', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const note = await customerService.addNote(customerId, content, user.id);

        revalidatePath(`/dashboard/customers/${customerId}`);
        return note;
    });
};

export const deleteCustomerAction = async (data: { id: string, reason: string }) => {
    return safeAction('deleteCustomer', async () => {
        await customerService.deleteCustomer(data.id);

        revalidatePath('/dashboard/customers');
        return true;
    });
};

export const sendCustomerMessageAction = async (data: { customerId: string, phone: string, message: string }) => {
    return safeAction('sendCustomerMessage', async () => {
        return await communicationService.sendMessage({
            recipient: data.phone,
            channel: 'sms',
            body: data.message,
            customerId: data.customerId
        });
    });
};
