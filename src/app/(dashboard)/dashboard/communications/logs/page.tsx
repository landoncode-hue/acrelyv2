import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import CommunicationLogsClient from "./logs-client";

export default async function CommunicationsLogsPage({ searchParams }: { searchParams: Promise<{ status?: string, channel?: string }> }) {
    const { status, channel } = await searchParams;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const { role } = user;
    if (!['sysadmin', 'ceo', 'md'].includes(role || "")) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Unauthorized - Admin access required</p>
            </div>
        );
    }

    const statusFilter = status || "all";
    const channelFilter = channel || "all";

    let logsCountQuery = sql`
        SELECT COUNT(*) FROM communication_logs
        WHERE 1=1
    `;

    let logsQuery = sql`
        SELECT * FROM communication_logs
        WHERE 1=1
    `;

    if (statusFilter !== "all") {
        logsQuery = sql`${logsQuery} AND status = ${statusFilter}`;
        logsCountQuery = sql`${logsCountQuery} AND status = ${statusFilter}`;
    }

    if (channelFilter !== "all") {
        logsQuery = sql`${logsQuery} AND channel = ${channelFilter}`;
        logsCountQuery = sql`${logsCountQuery} AND channel = ${channelFilter}`;
    }

    logsQuery = sql`${logsQuery} ORDER BY sent_at DESC LIMIT 100`;

    const logs = await logsQuery;

    return <CommunicationLogsClient logs={logs as any} />;
}
