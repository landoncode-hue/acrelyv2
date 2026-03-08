"use server";

import { safeAction } from "@/lib/safe-action";
import { SupportService } from "@/lib/services/SupportService";
import { ProfileService } from "@/lib/services/ProfileService";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Support Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const supportService = new SupportService();
const profileService = new ProfileService();

export const respondToTicketAction = async (ticketId: string, response: string, status: string = 'resolved') => {
    return safeAction('respondToTicket', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        // Role check
        const profile = await profileService.getProfile(user.id);
        if (!profile?.is_staff) {
            throw new Error("Insufficient permissions");
        }

        await supportService.respondToTicket(ticketId, response, status);

        revalidatePath("/dashboard/support");
        return true;
    });
};
