"use server";

import { safeAction } from '@/lib/safe-action';
import { DeleteService } from '@/lib/services/DeleteService';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Delete Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const deleteService = new DeleteService();

export const deleteCustomerAction = async (customerId: string) => {
    return safeAction("deleteCustomer", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized: User not authenticated.");

        await deleteService.deleteCustomer(customerId);

        revalidatePath('/dashboard/customers');
        revalidatePath('/dashboard');
        return true;
    });
};

export const deleteAllocationAction = async (allocationId: string) => {
    return safeAction("deleteAllocation", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized: User not authenticated.");

        await deleteService.deleteAllocation(allocationId);

        revalidatePath('/dashboard/allocations');
        revalidatePath('/dashboard/customers');
        return true;
    });
};

export const deletePaymentAction = async (paymentId: string) => {
    return safeAction("deletePayment", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized: User not authenticated.");

        await deleteService.deletePayment(paymentId);

        revalidatePath('/dashboard/payments');
        revalidatePath('/dashboard/allocations');
        revalidatePath('/dashboard/customers');
        return true;
    });
};

export const deleteLeadAction = async (leadId: string) => {
    return safeAction("deleteLead", async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized: User not authenticated.");

        await deleteService.deleteLead(leadId);

        revalidatePath('/dashboard/leads');
        return true;
    });
};
