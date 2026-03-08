"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApartmentService } from "@/lib/services/ApartmentService";
import { getCurrentUser } from "@/lib/auth/session";
import { CreateApartmentSchema, UpdateApartmentSchema } from "@/lib/validations/apartment";

/**
 * Apartment Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const apartmentService = new ApartmentService();

export const createApartmentAction = async (input: z.infer<typeof CreateApartmentSchema>) => {
    return safeAction('createApartment', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const apartment = await apartmentService.createApartment(input, user.id);

        revalidatePath('/dashboard/apartments');
        return apartment;
    });
};

export const updateApartmentAction = async (input: z.infer<typeof UpdateApartmentSchema>) => {
    return safeAction('updateApartment', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const apartment = await apartmentService.updateApartment(input, user.id);

        revalidatePath('/dashboard/apartments');
        revalidatePath(`/dashboard/apartments/${input.id}`);
        return apartment;
    });
};

export const deleteApartmentAction = async (id: string) => {
    return safeAction('deleteApartment', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await apartmentService.deleteApartment(id, user.id);

        revalidatePath('/dashboard/apartments');
        return true;
    });
};
