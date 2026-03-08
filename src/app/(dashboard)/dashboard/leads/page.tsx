import { LeadsService } from "@/lib/services/LeadsService";
import LeadsClient from "./leads-client";

const leadsService = new LeadsService();

export default async function LeadsPage() {
    const leads = await leadsService.getLeads();

    return <LeadsClient initialLeads={leads || []} />;
}
