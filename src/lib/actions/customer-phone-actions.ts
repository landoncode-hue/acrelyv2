"use server";

import { revalidatePath } from "next/cache";
import { safeAction } from "@/lib/safe-action";
import { CustomerPhoneService } from "@/lib/services/CustomerPhoneService";
import { type PhoneNumber } from "@/lib/utils/phone";

/**
 * Customer Phone Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const phoneService = new CustomerPhoneService();

export const getCustomerPhoneNumbersAction = async (customerId: string) => {
    return safeAction('getCustomerPhoneNumbers', async () => {
        return await phoneService.getPhoneNumbers(customerId);
    });
};

export const addCustomerPhoneNumberAction = async (
    customerId: string,
    phoneNumber: string,
    label: string = "Additional",
    isPrimary: boolean = false
) => {
    return safeAction('addCustomerPhoneNumber', async () => {
        const data = await phoneService.addPhoneNumber(customerId, phoneNumber, label, isPrimary);

        revalidatePath(`/dashboard/customers/${customerId}`);
        return data;
    });
};

export const updateCustomerPhoneNumberAction = async (
    phoneId: string,
    updates: Partial<Pick<PhoneNumber, "phone_number" | "label" | "is_primary">>
) => {
    return safeAction('updateCustomerPhoneNumber', async () => {
        await phoneService.updatePhoneNumber(phoneId, updates);

        revalidatePath('/dashboard/customers');
        // Ideally we'd also revalidate the specific customer page, 
        // but it requires customerId which we'd have to fetch. 
        // The service does it internally if is_primary is changed, but we can't easily revalidatePath here without the ID.
        // Actually, let's keep it simple for now as the service handles the logic.
        return true;
    });
};

export const deleteCustomerPhoneNumberAction = async (phoneId: string) => {
    return safeAction('deleteCustomerPhoneNumber', async () => {
        const customerId = await phoneService.deletePhoneNumber(phoneId);

        if (customerId) {
            revalidatePath(`/dashboard/customers/${customerId}`);
        }
        revalidatePath('/dashboard/customers');

        return true;
    });
};

export const setPrimaryPhoneNumberAction = async (
    phoneId: string,
    customerId: string
) => {
    return safeAction('setPrimaryPhoneNumber', async () => {
        await phoneService.setPrimary(phoneId, customerId);

        revalidatePath(`/dashboard/customers/${customerId}`);
        revalidatePath('/dashboard/customers');

        return true;
    });
};

export const getPrimaryPhoneNumberAction = async (customerId: string) => {
    return safeAction('getPrimaryPhoneNumber', async () => {
        return await phoneService.getPrimaryNumber(customerId);
    });
};
