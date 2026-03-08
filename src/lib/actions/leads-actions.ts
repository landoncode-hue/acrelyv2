"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LeadsService } from "@/lib/services/LeadsService";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Leads Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const CreateLeadSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(1, "Phone number is required"),
    source: z.string().min(1, "Source is required"),
    interest: z.string().optional(),
    assigned_to: z.string().uuid().optional(),
    next_follow_up_at: z.string().optional(),
});

const UpdateLeadSchema = CreateLeadSchema.partial().extend({
    id: z.string().uuid(),
    status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "converted", "lost"]).optional(),
    last_contacted_at: z.string().optional(),
});

const leadsService = new LeadsService();

export const createLeadAction = async (input: z.infer<typeof CreateLeadSchema>) => {
    return safeAction("createLead", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        return await leadsService.createLead(input, user.id);
    });
};

export const updateLeadAction = async (input: z.infer<typeof UpdateLeadSchema>) => {
    return safeAction("updateLead", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const { id, ...updates } = input;
        await leadsService.updateLead(id, updates);

        revalidatePath("/dashboard/leads");
        return true;
    });
};

export const deleteLeadAction = async (id: string) => {
    return safeAction("deleteLead", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await leadsService.deleteLead(id);

        revalidatePath("/dashboard/leads");
        return true;
    });
};

export const checkLeadConflictAction = async (email?: string, phone?: string) => {
    return safeAction("checkLeadConflict", async () => {
        return await leadsService.checkConflict(email, phone);
    });
};

export const convertLeadAction = async (leadId: string, additionalData?: {
    email?: string;
    address?: string;
    occupation?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
}) => {
    return safeAction("convertLead", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const customer = await leadsService.convertLead(leadId, user.id, additionalData);

        revalidatePath("/dashboard/leads");
        revalidatePath("/dashboard/customers");
        return customer;
    });
};

export const addLeadNoteAction = async (leadId: string, content: string) => {
    return safeAction("addLeadNote", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const sql = (await import("@/lib/db")).default;
        await sql`
            INSERT INTO interaction_logs (lead_id, author_id, content, type)
            VALUES (${leadId}, ${user.id}, ${content}, 'note')
        `;

        revalidatePath(`/dashboard/leads/${leadId}`);
        return true;
    });
};
