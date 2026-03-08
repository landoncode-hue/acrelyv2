import { AgentService } from "@/lib/services/AgentService";
import { CreateAgentClient } from "./create-agent-client";

export const metadata = {
    title: "Register New Agent | Acrely",
};

export default async function CreateAgentPage() {
    const agentService = new AgentService();
    const profiles = await agentService.getAllProfiles();

    return <CreateAgentClient profiles={profiles} />;
}
