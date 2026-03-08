"use server";

import { safeAction } from "@/lib/safe-action";
import { ProfileService } from "@/lib/services/ProfileService";

export const getAgentsAction = async () => {
    return safeAction("getAgents", async () => {
        const service = new ProfileService();
        return await service.getAgents();
    });
};
