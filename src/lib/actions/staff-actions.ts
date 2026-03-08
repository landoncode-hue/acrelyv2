"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { StaffService } from "../services/StaffService";
import { ProfileService } from "../services/ProfileService";
import {
    InviteStaffSchema,
    UpdateStaffStatusSchema,
    UpdateStaffRoleSchema,
    ResetStaffPasswordSchema
} from "../validations/staff";
import { getCurrentUser } from "@/lib/auth/session";

export const inviteStaffAction = async (input: z.infer<typeof InviteStaffSchema>) => {
    return safeAction('inviteStaff', async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");

        const profileService = new ProfileService();
        const currentProfile = await profileService.getProfile(currentUser.id);

        if (!currentProfile || !['sysadmin', 'ceo'].includes(currentProfile.role)) {
            throw new Error("Forbidden: Only sysadmin and CEO can invite staff");
        }

        const staffService = new StaffService();
        const result = await staffService.inviteStaff({
            ...input,
            invited_by: currentUser.id,
            inviter_name: currentProfile.full_name || 'Administrator'
        });

        if (!result.success) {
            throw new Error(result.error || "Failed to invite staff member");
        }

        revalidatePath('/dashboard/staff');
        return result.user;
    });
};

export const updateStaffStatusAction = async (input: z.infer<typeof UpdateStaffStatusSchema>) => {
    return safeAction('updateStaffStatus', async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");

        const profileService = new ProfileService();
        const currentProfile = await profileService.getProfile(currentUser.id);

        if (!currentProfile || !['sysadmin', 'ceo', 'md'].includes(currentProfile.role)) {
            throw new Error("Forbidden: Insufficient permissions");
        }

        const staffService = new StaffService();
        const success = await staffService.updateStaffStatus(input.staffId, input.status, input.reason);

        if (!success) {
            throw new Error("Failed to update staff status");
        }

        revalidatePath('/dashboard/staff');
        revalidatePath(`/dashboard/staff/${input.staffId}`);
        return true;
    });
};

export const updateStaffRoleAction = async (input: z.infer<typeof UpdateStaffRoleSchema>) => {
    return safeAction('updateStaffRole', async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");

        const profileService = new ProfileService();
        const currentProfile = await profileService.getProfile(currentUser.id);

        if (!currentProfile || !['sysadmin', 'ceo', 'md'].includes(currentProfile.role)) {
            throw new Error("Forbidden: Insufficient permissions");
        }

        const staffService = new StaffService();
        const success = await staffService.updateStaffRole(input.staffId, input.role, input.reason);

        if (!success) {
            throw new Error("Failed to update staff role");
        }

        revalidatePath('/dashboard/staff');
        revalidatePath(`/dashboard/staff/${input.staffId}`);
        return true;
    });
};

export const resetStaffPasswordAction = async (input: z.infer<typeof ResetStaffPasswordSchema>) => {
    return safeAction('resetStaffPassword', async () => {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Unauthorized");

        const profileService = new ProfileService();
        const currentProfile = await profileService.getProfile(currentUser.id);

        if (!currentProfile || !['sysadmin', 'ceo', 'md'].includes(currentProfile.role)) {
            throw new Error("Forbidden: Insufficient permissions");
        }

        const staffService = new StaffService();
        const success = await staffService.resetPassword(input.staffId);

        if (!success) {
            throw new Error("Failed to send password reset email");
        }

        return true;
    });
};
