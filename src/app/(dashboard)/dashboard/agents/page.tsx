import { AgentService } from "@/lib/services/AgentService";
import { PageHeader } from "@/components/layout/page-header";
import { AgentClient } from "./agent-client";

export const metadata = {
    title: "Agents Management | Acrely",
};

export default async function AgentsManagementPage() {
    const agentService = new AgentService();
    const agents = await agentService.getAllAgents();

    return (
        <div className="space-y-8">
            <PageHeader
                title="Agents"
                description="Approve and manage real estate agents."
            />

            <AgentClient initialAgents={agents} />
        </div>
    );
}
