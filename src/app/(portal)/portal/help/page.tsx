import { SupportService } from "@/lib/services/SupportService";
import PortalHelpClient from "./portal-help-client";
import { getCurrentUser } from "@/lib/auth/session";

const supportService = new SupportService();

export default async function PortalHelpPage() {
    const user = await getCurrentUser();

    if (!user) return <div>Unauthorized</div>;

    const tickets = await supportService.getTickets(user.id);

    return <PortalHelpClient initialTickets={tickets || []} />;
}
