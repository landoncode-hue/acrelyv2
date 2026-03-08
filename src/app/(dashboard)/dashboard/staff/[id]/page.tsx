import { getCurrentUser } from "@/lib/auth/session";
import sql from "@/lib/db";
import StaffDetailClient from "./staff-detail-client";
import { redirect } from "next/navigation";

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
        redirect("/login");
    }

    // id was already awaited above

    // Fetch staff profile
    const profileData = await sql`
        SELECT * FROM profiles WHERE id = ${id} AND is_staff = true
    `;
    const staffProfile = profileData.length > 0 ? profileData[0] : null;

    // Fetch staff history
    const historyData = await sql`
        SELECT * FROM staff_history 
        WHERE profile_id = ${id} 
        ORDER BY created_at DESC
    `;

    // Fetch audit logs for this user
    const auditData = await sql`
        SELECT * FROM audit_logs 
        WHERE target_id = ${id} 
        ORDER BY created_at DESC 
        LIMIT 20
    `;

    return (
        <StaffDetailClient
            staffId={id}
            initialStaffProfile={staffProfile as any}
            initialHistory={historyData as any}
            initialAuditLogs={auditData as any}
        />
    );
}
