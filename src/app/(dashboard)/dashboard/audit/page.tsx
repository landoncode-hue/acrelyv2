import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import AuditTrailClient from "./audit-client";

export default async function AuditTrailPage() {
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

    const logs = await sql`
        SELECT 
            audit_logs.*,
            json_build_object(
                'full_name', profiles.full_name,
                'email', profiles.email
            ) as profiles
        FROM audit_logs
        LEFT JOIN profiles ON audit_logs.actor_user_id = profiles.id
        ORDER BY created_at DESC
        LIMIT 200
    `;

    return <AuditTrailClient initialLogs={logs as any[]} />;
}
