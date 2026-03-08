"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { CustomerService } from "@/lib/services/CustomerService";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * KYC Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const customerService = new CustomerService();

export async function submitKycDataAction(data: { id_type: string, id_number: string, id_url: string, selfie_url: string }) {
    return safeAction('submitKycData', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const customer = await customerService.getCustomerByProfileId(user.id);
        if (!customer) throw new Error("Customer record not found for this user");

        const result = await customerService.submitKycData(customer.id, data);
        revalidatePath("/dashboard/kyc");
        return result;
    });
}

export async function verifyKycAction(customerId: string, action: 'verify' | 'reject', reason?: string) {
    return safeAction('verifyKyc', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const result = await customerService.verifyKyc(customerId, action, user.id, reason);

        if (result) {
            revalidatePath("/dashboard/customers/kyc");
            revalidatePath(`/dashboard/customers/${customerId}`);
        }

        return result;
    });
}
