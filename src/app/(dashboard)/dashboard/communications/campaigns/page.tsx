import sql from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import CampaignsClient from "./campaigns-client";

export default async function CampaignsPage() {
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

    // 1. Fetch Counts
    const [customersRes, leadsRes, staffRes, overdueRes] = await Promise.all([
        sql`SELECT COUNT(*) FROM customers`,
        sql`SELECT COUNT(*) FROM leads`,
        sql`SELECT COUNT(*) FROM profiles WHERE is_staff = true`,
        sql`
            SELECT COUNT(DISTINCT a.customer_id)
            FROM payment_plan_installments ppi
            JOIN payment_plans pp ON ppi.plan_id = pp.id
            JOIN allocations a ON pp.allocation_id = a.id
            WHERE ppi.status = 'overdue'
        `
    ]);

    const counts = {
        customers: parseInt(customersRes[0].count),
        leads: parseInt(leadsRes[0].count),
        staff: parseInt(staffRes[0].count),
        debtors: parseInt(overdueRes[0].count),
    };

    // 2. Fetch Templates
    const templates = await sql`
        SELECT * FROM communication_templates ORDER BY name ASC
    `;

    // 3. Fetch Campaign History 
    const history = await sql`
        SELECT c.*, p.full_name as created_by_name 
        FROM campaigns c
        LEFT JOIN profiles p ON c.created_by = p.id
        ORDER BY c.created_at DESC 
        LIMIT 20
    `;

    return <CampaignsClient counts={counts} templates={templates as any} initialHistory={history as any} />;
}
