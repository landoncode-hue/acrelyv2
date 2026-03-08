"use server";

import { safeAction } from "@/lib/safe-action";
import { AgentService } from "@/lib/services/AgentService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Commission Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const agentService = new AgentService();

const withdrawalSchema = z.object({
    amount: z.number().min(1, "Amount must be greater than 0")
});

export const requestWithdrawalAction = async (input: z.infer<typeof withdrawalSchema>) => {
    return safeAction("requestWithdrawal", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await agentService.submitWithdrawalRequest(user.id, input.amount);

        revalidatePath("/dashboard/commissions");
        return true;
    });
};
