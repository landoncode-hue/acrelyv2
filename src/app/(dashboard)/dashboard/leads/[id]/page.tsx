import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { LeadDetailClient } from "./lead-detail-client";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }


    // Fetch lead with assigned user profile
    const leadResult = await sql`
SELECT
leads.*,
    json_build_object(
        'full_name', profiles.full_name,
        'email', profiles.email
    ) as profiles
        FROM leads
        LEFT JOIN profiles ON leads.assigned_to = profiles.id
        WHERE leads.id = ${id}
`;

    const lead = leadResult.length > 0 ? leadResult[0] : null;

    return <LeadDetailClient lead={lead as any} />;
}
