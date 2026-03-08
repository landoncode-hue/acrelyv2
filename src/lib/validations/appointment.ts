import { z } from "zod";
import { AppointmentStatus } from "@/lib/services/AppointmentService";

export const CreateAppointmentSchema = z.object({
    apartmentId: z.string().uuid(),
    customerId: z.string().uuid(),
    appointmentDate: z.string(),
    notes: z.string().optional(),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] as [string, ...string[]]).optional() as z.ZodType<AppointmentStatus | undefined>
});

export const UpdateAppointmentSchema = z.object({
    id: z.string().uuid(),
    appointmentDate: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] as [string, ...string[]]).optional() as z.ZodType<AppointmentStatus | undefined>
});

export type CreateAppointmentValues = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentValues = z.infer<typeof UpdateAppointmentSchema>;
