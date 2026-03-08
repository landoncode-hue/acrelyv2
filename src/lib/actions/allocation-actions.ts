"use server";

import { safeAction } from "@/lib/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AllocationService } from "../services/AllocationService";
import { AllocationRepository } from "../repositories/AllocationRepository";
import { CreateAllocationSchema } from "@/lib/validations/allocation";

export const createAllocation = async (input: z.infer<typeof CreateAllocationSchema>) => {
    return safeAction('createAllocation', async () => {
        // Mock user
        const user = { id: "mocked-user-id" };

        const allocationService = new AllocationService();
        const allocationIds = await allocationService.createRequest(input, user.id);

        revalidatePath('/dashboard/allocations');
        return allocationIds;
    });
};

const approveSchema = z.object({
    allocationId: z.string().uuid(),
    plotId: z.string().uuid().nullable().optional()
});

export const approveAllocationAction = async (input: z.infer<typeof approveSchema>) => {
    return safeAction('approveAllocation', async () => {
        // Mock user
        const user = { id: "mocked-user-id" };

        const service = new AllocationService();
        // If plotId is provided, we might need to assign it first or the stored proc might handle it.
        // In the original code, it was passed to the edge function.
        // For now, let's just call approve. If assign logic is needed, it should be in the service.
        await service.approve(input.allocationId, user.id);

        revalidatePath('/dashboard/allocations/pending');
        revalidatePath(`/dashboard/allocations/${input.allocationId}`);
        return true;
    });
};

export const rejectAllocationAction = async (input: { allocationId: string }) => {
    return safeAction('rejectAllocation', async () => {
        // Mock user
        const user = { id: "mocked-user-id" };

        const allocationRepository = new AllocationRepository();
        await allocationRepository.update(input.allocationId, { status: 'rejected' } as any);

        revalidatePath('/dashboard/allocations/pending');
        revalidatePath(`/dashboard/allocations/${input.allocationId}`);
        return true;
    });
};

const assignPlotSchema = z.object({
    allocationId: z.string().uuid(),
    plotId: z.string().uuid(),
    assignSuffix: z.string().optional()
});

export const assignPlotAction = async (input: z.infer<typeof assignPlotSchema>) => {
    return safeAction('assignPlot', async () => {
        // Mock user
        const user = { id: "mocked-user-id" };

        const service = new AllocationService();
        const allocationRepository = new AllocationRepository();

        // Check allocation preference to determine size
        const alloc = await allocationRepository.findById(input.allocationId);
        const size = (alloc as any)?.plot_half ? 'half_plot' : 'full_plot';

        await service.assignPlot(input.allocationId, input.plotId, size, user.id, input.assignSuffix);

        revalidatePath(`/dashboard/allocations/${input.allocationId}`);
        return true;
    });
};

const reassignSchema = z.object({
    allocationId: z.string().uuid(),
    newPlotId: z.string().uuid(),
    reason: z.string().min(5)
});

export const reassignAllocationAction = async (input: z.infer<typeof reassignSchema>) => {
    return safeAction('reassignAllocation', async () => {
        // Mock user
        const user = { id: "mocked-user-id" };

        const service = new AllocationService();
        await service.reassign(input.allocationId, input.newPlotId, input.reason, user.id);

        revalidatePath(`/dashboard/allocations/${input.allocationId}`);
        return true;
    });
};

const cancelSchema = z.object({
    allocationId: z.string().uuid(),
    reason: z.string().min(5)
});

export const cancelAllocationAction = async (input: z.infer<typeof cancelSchema>) => {
    return safeAction('cancelAllocation', async () => {
        // Mock user
        const user = { id: "mocked-user-id" };

        const service = new AllocationService();
        await service.cancel(input.allocationId, input.reason, user.id);

        revalidatePath(`/dashboard/allocations/${input.allocationId}`);
        return true;
    });
};

const completeSchema = z.object({
    allocationId: z.string().uuid()
});

export const completeAllocationAction = async (input: z.infer<typeof completeSchema>) => {
    return safeAction('completeAllocation', async () => {
        // Mock user
        const user = { id: "mocked-user-id" };

        const { ProfileService } = await import("../services/ProfileService");
        const profileService = new ProfileService();
        const profile = await profileService.getProfile(user.id);
        const role = profile?.role || 'staff';

        const service = new AllocationService();
        await service.complete(input.allocationId, user.id, role);

        revalidatePath(`/dashboard/allocations/${input.allocationId}`);
        return true;
    });
};

/**
 * Legacy: Keep creating allocation core logic if needed for internal scripts, 
 * but better to use AllocationService directly.
 */
export async function createAllocationCore(user: any, input: any) {
    const service = new AllocationService();
    return service.createRequest(input, user?.id || 'system');
}
