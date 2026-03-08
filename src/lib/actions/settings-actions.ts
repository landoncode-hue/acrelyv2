"use server";

import { safeAction } from "@/lib/safe-action";
import { AgentService } from "@/lib/services/AgentService";
import { ProfileService } from "@/lib/services/ProfileService";
import { SettingsService } from "@/lib/services/SettingsService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Settings Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const agentService = new AgentService();
const profileService = new ProfileService();
const settingsService = new SettingsService();

const updateAgentSchema = z.object({
    bank_name: z.string(),
    account_number: z.string(),
    account_name: z.string()
});

const updateAvatarSchema = z.object({
    avatar_url: z.string().url()
});

const updateSettingsSchema = z.object({
    updates: z.array(z.object({
        key: z.string(),
        value: z.any()
    }))
});

export const updateAgentDetailsAction = async (input: z.infer<typeof updateAgentSchema>) => {
    return safeAction("updateAgentDetails", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await agentService.updateBankingDetails(user.id, input);

        revalidatePath("/dashboard/settings");
        return true;
    });
};

export const updateAvatarAction = async (input: z.infer<typeof updateAvatarSchema>) => {
    return safeAction("updateAvatar", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await profileService.updateAvatar(user.id, input.avatar_url);

        revalidatePath("/dashboard/settings");
        return true;
    });
};

export const updateSystemSettingsAction = async (input: z.infer<typeof updateSettingsSchema>) => {
    return safeAction("updateSystemSettings", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await settingsService.updateSystemSettings(input.updates);

        revalidatePath("/dashboard/settings");
        return true;
    });
};
