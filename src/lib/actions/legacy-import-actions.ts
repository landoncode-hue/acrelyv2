"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { LegacyImportService, LegacyImportData } from "@/lib/services/LegacyImportService";
import { ProfileService } from "@/lib/services/ProfileService";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Legacy Import Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const legacyImportService = new LegacyImportService();
const profileService = new ProfileService();

export const importLegacyDataAction = async (data: LegacyImportData) => {
    return safeAction('importLegacyData', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized: Please log in");

        // Permission check
        const profile = await profileService.getProfile(user.id);
        if (!profile?.is_staff) {
            throw new Error("Unauthorized: Only staff can import legacy data");
        }

        const customerId = await legacyImportService.importLegacyData(data, user.id);

        revalidatePath('/dashboard/customers');
        return customerId;
    });
};
