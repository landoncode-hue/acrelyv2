"use server";

import { safeAction } from "@/lib/safe-action";
import { ProfileService } from "@/lib/services/ProfileService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Onboarding Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const profileService = new ProfileService();

const updateProfileSchema = z.object({
    phone: z.string().min(1, "Phone is required"),
    address: z.string().optional()
});

export const updateOnboardingProfileAction = async (input: z.infer<typeof updateProfileSchema>) => {
    return safeAction("updateOnboardingProfile", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await profileService.updateProfile(user.id, {
            phone: input.phone,
            address: input.address
        });

        return { success: true };
    });
};

export const completeOnboardingAction = async () => {
    return safeAction("completeOnboarding", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await profileService.updateProfile(user.id, {
            onboarding_completed: true
        });

        revalidatePath("/dashboard");
        return { success: true };
    });
};
