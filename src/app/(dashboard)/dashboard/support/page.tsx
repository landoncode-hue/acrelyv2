import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { SupportClient } from "./support-client";

export default async function SupportInboxPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const tickets = await sql`
        SELECT 
            support_tickets.*,
            json_build_object(
                'full_name', profiles.full_name,
                'email', profiles.email
            ) as profiles
        FROM support_tickets
        LEFT JOIN profiles ON support_tickets.user_id = profiles.id
        ORDER BY created_at DESC
    `;

    return <SupportClient initialTickets={tickets as any[]} />;
}
