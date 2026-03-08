import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import AuditLogDetailClient from "./audit-detail-client";

export default async function AuditLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    const logs = await sql`
        SELECT 
            audit_logs.*,
            json_build_object(
                'full_name', profiles.full_name,
                'email', profiles.email
            ) as actor
        FROM audit_logs
        LEFT JOIN profiles ON audit_logs.actor_user_id = profiles.id
        WHERE audit_logs.id = ${id}
    `;

    const log = logs.length > 0 ? logs[0] : null;

    return <AuditLogDetailClient log={log} />;
}
