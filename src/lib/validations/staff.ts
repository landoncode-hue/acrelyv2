import { z } from "zod";

export const InviteStaffSchema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    role: z.enum(["sysadmin", "ceo", "md", "frontdesk"]),
    employee_id: z.string().optional(),
    department: z.string().optional(),
});

export const UpdateStaffStatusSchema = z.object({
    staffId: z.string().uuid(),
    status: z.enum(["active", "suspended", "deactivated"]),
    reason: z.string().optional(),
});

export const UpdateStaffRoleSchema = z.object({
    staffId: z.string().uuid(),
    role: z.enum(["sysadmin", "ceo", "md", "frontdesk"]),
    reason: z.string().optional(),
});

export const ResetStaffPasswordSchema = z.object({
    staffId: z.string().uuid(),
});
