"use server";

import { safeAction } from "@/lib/safe-action";
import { PaymentPlanService } from "@/lib/services/PaymentPlanService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Payment Plan Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const paymentPlanService = new PaymentPlanService();

const createPlanSchema = z.object({
    name: z.string().min(1, "Name is required"),
    duration_months: z.number().int().min(1),
    interest_rate: z.number().min(0),
    initial_deposit_percent: z.number().min(0).max(100),
    description: z.string().optional()
});

const updatePlanSchema = z.object({
    id: z.string().uuid(),
    is_active: z.boolean().optional(),
    name: z.string().optional(),
});

const deletePlanSchema = z.object({
    id: z.string().uuid()
});

export const createPaymentPlanAction = async (input: z.infer<typeof createPlanSchema>) => {
    return safeAction("createPaymentPlan", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const plan = await paymentPlanService.createPaymentPlan(input, user.id);

        revalidatePath("/dashboard/payments/plans");
        return plan;
    });
};

export const updatePaymentPlanAction = async (input: z.infer<typeof updatePlanSchema>) => {
    return safeAction("updatePaymentPlan", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const { id, ...updates } = input;
        await paymentPlanService.updatePaymentPlan(id, updates);

        revalidatePath("/dashboard/payments/plans");
        return true;
    });
};

export const deletePaymentPlanAction = async (input: z.infer<typeof deletePlanSchema>) => {
    return safeAction("deletePaymentPlan", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await paymentPlanService.deletePaymentPlan(input.id);

        revalidatePath("/dashboard/payments/plans");
        return true;
    });
};
