import sql from "@/lib/db";
import TemplatesClient from "./templates-client";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function TemplatesPage() {
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

    // Fetch templates directly
    const templates = await sql`
        SELECT * FROM communication_templates ORDER BY type ASC
    `;

    return <TemplatesClient initialTemplates={templates as any} />;
}
