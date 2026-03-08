import { getCurrentUser } from "@/lib/auth/session";
import sql from "@/lib/db";
import StaffMonitoringClient from "./monitoring-client";
import { redirect } from "next/navigation";

export default async function StaffMonitoringPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Only admins can access
    const { role } = user;
    if (!['sysadmin', 'ceo', 'md'].includes(role || "")) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Unauthorized - Admin access required</p>
            </div>
        );
    }

    // Fetch metrics
    const allStaff = await sql`
        SELECT staff_status FROM profiles WHERE is_staff = true
    `;

    const metrics = {
        total: allStaff.length,
        active: allStaff.filter((s: any) => s.staff_status === 'active' || !s.staff_status).length,
        invited: allStaff.filter((s: any) => s.staff_status === 'invited').length,
        suspended: allStaff.filter((s: any) => s.staff_status === 'suspended').length,
        deactivated: allStaff.filter((s: any) => s.staff_status === 'deactivated').length,
    };

    // Fetch recent activity
    const recentActivity = await sql`
        SELECT * FROM audit_logs 
        WHERE action_type IN (
            'STAFF_INVITED',
            'STAFF_ACTIVATED',
            'STAFF_SUSPENDED',
            'STAFF_DEACTIVATED',
            'ROLE_CHANGED',
            'IMPERSONATION_STARTED'
        )
        ORDER BY created_at DESC 
        LIMIT 10
    `;

    return (
        <StaffMonitoringClient
            metrics={metrics}
            recentActivity={recentActivity as any}
        />
    );
}
