"use server";

import { safeAction } from "@/lib/actions/safe-action";
import { EstateService } from "@/lib/services/EstateService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

const BulkCreatePlotsSchema = z.object({
    estateId: z.string().uuid(),
    plots: z.array(z.any()),
    auditLog: z.any().optional()
});

const CreateEstateSchema = z.object({
    name: z.string().min(1),
    location: z.string().min(1),
    price: z.number().positive(),
    totalPlots: z.number().int().min(1),
    description: z.string().optional(),
});

export const bulkCreatePlotsAction = safeAction(
    BulkCreatePlotsSchema,
    async ({ estateId, plots, auditLog: providedAuditLog }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const estateService = new EstateService();

        const auditLog = providedAuditLog || {
            actor_user_id: user.id,
            action_type: 'bulk_create_plots',
            target_id: estateId,
            target_type: 'estate',
            changes: JSON.stringify({ count: plots.length })
        };

        const result = await estateService.bulkCreatePlots(plots, auditLog);

        revalidatePath("/dashboard/estates");
        revalidatePath(`/dashboard/estates/${estateId}`);
        revalidatePath("/dashboard/estates/inventory");

        return { success: true, count: result };
    }
);

export const getEstatesAction = safeAction(
    z.object({}),
    async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const estateService = new EstateService();
        return await estateService.getEstates();
    }
);

export const getEstatePlotsAction = safeAction(
    z.object({ estateId: z.string().uuid() }),
    async ({ estateId }) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const sql = (await import("@/lib/db")).default;
        const result = await sql`
            SELECT id, plot_number, status, dimensions
            FROM plots
            WHERE estate_id = ${estateId} AND status IN ('available', 'reserved')
            ORDER BY NULLIF(regexp_replace(plot_number, '\D', '', 'g'), '')::numeric
        `;

        return { success: true, plots: result as any[] };
    }
);

export const createEstateAction = safeAction(
    CreateEstateSchema,
    async (data) => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const estateService = new EstateService();
        const result = await estateService.createEstate(data, user.id);

        revalidatePath("/dashboard/estates");
        revalidatePath("/dashboard/estates/inventory");

        return { success: true, estate: result };
    }
);

export const updateEstateAction = safeAction(
    z.any(),
    async (data) => {
        return { success: true, estate: data };
    }
);

export const archiveEstateAction = safeAction(
    z.any(),
    async ({ estateId }) => {
        return { success: true };
    }
);

export const checkPlotConflictsAction = safeAction(
    z.any(),
    async (data) => {
        return { success: true, conflicts: [] as string[] };
    }
);

export const createPlotAction = safeAction(
    z.any(),
    async (data) => {
        return { success: true, plot: data };
    }
);
