"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AppointmentService } from "@/lib/services/AppointmentService";
import { getCurrentUser } from "@/lib/auth/session";
import { CreateAppointmentSchema, UpdateAppointmentSchema } from "@/lib/validations/appointment";

/**
 * Appointment Server Actions
 * Refactored to remove direct Supabase dependencies.
 */

const appointmentService = new AppointmentService();

export const createAppointmentAction = async (input: z.infer<typeof CreateAppointmentSchema>) => {
    return safeAction('createAppointment', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const appointment = await appointmentService.createAppointment(input, user.id);

        revalidatePath('/dashboard/appointments');
        revalidatePath(`/dashboard/apartments/${input.apartmentId}`);
        return appointment;
    });
};

export const updateAppointmentAction = async (input: z.infer<typeof UpdateAppointmentSchema>) => {
    return safeAction('updateAppointment', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const appointment = await appointmentService.updateAppointment(input, user.id);

        revalidatePath('/dashboard/appointments');
        return appointment;
    });
};

export const deleteAppointmentAction = async (id: string) => {
    return safeAction('deleteAppointment', async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        await appointmentService.deleteAppointment(id, user.id);

        revalidatePath('/dashboard/appointments');
        return true;
    });
};
