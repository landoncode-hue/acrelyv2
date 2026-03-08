import { AgentService } from "@/lib/services/AgentService";
import { AgentProfileClient } from "./agent-profile-client";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Agent Details | Acrely",
};

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const agentService = new AgentService();
    const agent = await agentService.getById(id);

    if (!agent) {
        notFound();
    }

    let allocations: any[] = [];
    let commissions: any[] = [];
    let withdrawals: any[] = [];

    if (agent.status === 'active' || agent.status === 'suspended') {
        const [a, c, w] = await Promise.all([
            agentService.getAgentAllocations(agent.profile_id),
            agentService.getAgentCommissions(agent.id),
            agentService.getAgentWithdrawals(agent.id)
        ]);
        allocations = a;
        commissions = c;
        withdrawals = w;
    }

    return (
        <AgentProfileClient
            agent={agent}
            allocations={allocations}
            commissions={commissions}
            withdrawals={withdrawals}
        />
    );
}
