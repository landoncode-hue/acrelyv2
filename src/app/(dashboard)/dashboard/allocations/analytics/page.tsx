import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import AllocationAnalyticsClient from "./analytics-client";

export default async function AllocationAnalyticsPage() {
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

    // Call the database functions directly
    const metricsResult = await sql`SELECT * FROM get_allocation_metrics()`;
    const estateRevenueResult = await sql`SELECT * FROM get_estate_revenue()`;
    const conversionResult = await sql`SELECT * FROM get_allocation_conversion_rate()`;

    const metrics = metricsResult.length > 0 ? metricsResult[0] : null;
    const estateRevenue = estateRevenueResult as any[];
    const conversion = conversionResult.length > 0 ? conversionResult[0] : null;

    return (
        <AllocationAnalyticsClient
            metrics={metrics as any}
            estateRevenue={estateRevenue}
            conversion={conversion as any}
        />
    );
}
