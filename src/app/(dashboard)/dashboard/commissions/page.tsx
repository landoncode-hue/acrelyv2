
import { getCurrentUser } from "@/lib/auth/session";
import { CommissionService } from "@/lib/services/CommissionService";
import CommissionsClient from "./commissions-client";
import { redirect } from "next/navigation";

export default async function CommissionsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const service = new CommissionService();
    const agent = await service.getAgentByProfileId(user.id);

    let commissions: any[] = [];
    let withdrawals: any[] = [];

    if (agent) {
        commissions = await service.getCommissions(agent.id) || [];
        withdrawals = await service.getWithdrawals(agent.id) || [];
    }

    return <CommissionsClient
        initialCommissions={commissions}
        initialWithdrawals={withdrawals}
        agentId={agent?.id}
    />;
}
