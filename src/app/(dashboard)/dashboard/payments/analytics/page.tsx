import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import sql from "@/lib/db";
import { PaymentAnalyticsClient } from "./analytics-client";

export default async function PaymentAnalyticsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch analytics data
    const [
        statsData,
        methodData,
        revenueData,
        overdueData,
        customersData,
        collectionData
    ] = await Promise.all([
        sql`SELECT * FROM get_payment_stats()`,
        sql`SELECT * FROM get_payment_method_breakdown()`,
        sql`SELECT * FROM get_revenue_by_month(6)`,
        sql`SELECT * FROM get_overdue_installments_report() LIMIT 10`,
        sql`SELECT * FROM get_top_paying_customers(10)`,
        sql`SELECT * FROM get_payment_collection_rate()`
    ]);

    const stats = statsData[0] || null;
    const methodBreakdown = methodData || [];
    const revenueByMonth = revenueData || [];
    const overdueInstallments = overdueData || [];
    const topCustomers = customersData || [];
    const collectionRate = collectionData[0] || null;

    return (
        <PaymentAnalyticsClient
            stats={stats}
            methodBreakdown={methodBreakdown as any[]}
            revenueByMonth={revenueByMonth as any[]}
            overdueInstallments={overdueInstallments as any[]}
            topCustomers={topCustomers as any[]}
            collectionRate={collectionRate}
        />
    );
}
