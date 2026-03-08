"use server";

import { safeAction } from "@/lib/actions/safe-action";
import { AgentService } from "@/lib/services/AgentService";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

const AgentIdSchema = z.object({
    agentId: z.string().uuid(),
});

const UpdateAgentSchema = z.object({
    agentId: z.string().uuid(),
    commission_rate: z.number().min(0).max(100).optional(),
    status: z.enum(['pending', 'active', 'suspended', 'rejected']).optional(),
});

const RegisterAgentSchema = z.object({
    profile_id: z.string().uuid(),
    commission_rate: z.number().min(0).max(100),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    account_name: z.string().optional(),
});

export const approveAgentAction = safeAction(
    AgentIdSchema,
    async ({ agentId }) => {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            throw new Error("Unauthorized");
        }

        const agentService = new AgentService();
        await agentService.approveAgent(agentId);

        revalidatePath("/dashboard/agents");
        revalidatePath(`/dashboard/agents/${agentId}`);

        return { success: true };
    }
);

export const rejectAgentAction = safeAction(
    AgentIdSchema,
    async ({ agentId }) => {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            throw new Error("Unauthorized");
        }

        const agentService = new AgentService();
        await agentService.rejectAgent(agentId);

        revalidatePath("/dashboard/agents");
        revalidatePath(`/dashboard/agents/${agentId}`);

        return { success: true };
    }
);

export const updateAgentAction = safeAction(
    UpdateAgentSchema,
    async ({ agentId, ...data }) => {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            throw new Error("Unauthorized");
        }

        const agentService = new AgentService();
        await agentService.updateAgent(agentId, data);

        revalidatePath("/dashboard/agents");
        revalidatePath(`/dashboard/agents/${agentId}`);

        return { success: true };
    }
);

export const registerAgentAction = safeAction(
    RegisterAgentSchema,
    async (data) => {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            throw new Error("Unauthorized");
        }

        const agentService = new AgentService();
        await agentService.registerAgent({
            ...data,
            status: 'active'
        });

        revalidatePath("/dashboard/agents");

        return { success: true };
    }
);

const ProcessWithdrawalSchema = z.object({
    requestId: z.string().uuid(),
    action: z.enum(['approve', 'reject', 'paid']),
    data: z.object({
        reason: z.string().optional(),
        ref: z.string().optional()
    }).optional()
});

export const processWithdrawalRequest = safeAction(
    ProcessWithdrawalSchema,
    async ({ requestId, action, data = {} }) => {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            throw new Error("Unauthorized");
        }

        const agentService = new AgentService();
        await agentService.processWithdrawalRequest(user.id, requestId, action, data);

        revalidatePath("/dashboard/commissions");
        revalidatePath("/dashboard/commissions/withdrawals");

        return { success: true };
    }
);
