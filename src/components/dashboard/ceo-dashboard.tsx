"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "./kpi-card";
import {
    DollarSign,
    Home,
    Activity,
    CreditCard,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { getExecutiveKPIs, getFrontdeskMetrics, getRevenueTrends } from "@/lib/actions/analytics-actions";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";

const safeFormatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
        return `₦${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
        return `₦${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
        return `₦${(value / 1_000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
};

interface CeoDashboardProps {
    profile: any;
    initialData?: {
        kpi: any;
        frontdesk: any;
        trends: any;
    };
}

export function CeoDashboard({ profile, initialData }: CeoDashboardProps) {
    // Start with loading true only if we don't have initial data
    const [loading, setLoading] = useState(!initialData);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [metrics, setMetrics] = useState({
        moneyReceived: initialData?.kpi?.total_revenue_collected || 0,
        moneyOwed: initialData?.kpi?.outstanding_balance || 0,
        overdueBalance: initialData?.kpi?.overdue_balance || 0,
        overdueCount: initialData?.kpi?.overdue_customers || 0,
        availablePlots: initialData?.kpi?.plots_available || 0,
        plotsSold: initialData?.kpi?.plots_sold || 0,
        pendingAllocations: initialData?.kpi?.pending_allocations || 0,
        failedMessages: initialData?.frontdesk?.failed_messages_count || 0
    });

    const [chartData, setChartData] = useState<any[]>(
        initialData?.trends
            ? initialData.trends.slice(0, 6).reverse().map((t: any) => ({
                month: t.period_label.split(' ')[0],
                amount: t.total_revenue
            }))
            : []
    );

    useEffect(() => {
        // If we have initial data, we don't need to fetch immediately
        if (initialData) return;

        async function loadDashboardData() {
            setLoading(true);

            try {
                // Fetch high-level KPIs from Server Actions
                const [kpiRes, frontdeskRes] = await Promise.all([
                    getExecutiveKPIs(),
                    getFrontdeskMetrics()
                ]);

                const kpiData = kpiRes.data;
                const fdData = frontdeskRes.data;

                if (kpiData) {
                    setMetrics({
                        moneyReceived: kpiData.total_revenue_collected,
                        moneyOwed: kpiData.outstanding_balance,
                        overdueBalance: kpiData.overdue_balance,
                        overdueCount: kpiData.overdue_customers,
                        availablePlots: kpiData.plots_available,
                        plotsSold: kpiData.plots_sold,
                        pendingAllocations: kpiData.pending_allocations,
                        failedMessages: fdData?.failed_messages_count || 0
                    });
                }

                // Chart Data (Revenue)
                const { data: trends } = await getRevenueTrends('monthly');
                if (trends) {
                    const formattedChartData = trends.slice(0, 6).reverse().map(t => ({
                        month: t.period_label.split(' ')[0],
                        amount: t.total_revenue
                    }));
                    setChartData(formattedChartData);
                }

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title={`Welcome back, ${profile.full_name?.split(' ')[0]}`}
                description="Here is your executive summary."
            />

            {/* 1. At-a-Glance KPI Grid (Human Concepts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Money Received */}
                <KpiCard
                    title="Money Received"
                    value={safeFormatCurrency(metrics.moneyReceived)}
                    icon={DollarSign}
                    className="border-primary/20"
                    trend={{ value: 0, label: "Total collected", positive: true }}
                />

                {/* Money Owed */}
                <KpiCard
                    title="Money Owed"
                    value={safeFormatCurrency(metrics.moneyOwed)}
                    icon={CreditCard}
                    description={`${safeFormatCurrency(metrics.overdueBalance)} is overdue`}
                />

                {/* Overdue Payments (Risk) */}
                <KpiCard
                    title="Overdue Payments"
                    value={metrics.overdueCount.toString()}
                    icon={AlertCircle}
                    description={`Customers with overdue balance`}
                    className={metrics.overdueCount > 0 ? "border-rose-200 bg-rose-50/10" : ""}
                />

                {/* Land Status */}
                <KpiCard
                    title="Land Status"
                    value={`${metrics.availablePlots} / ${metrics.availablePlots + metrics.plotsSold}`}
                    icon={Home}
                    description={`${metrics.plotsSold} plots sold`}
                />
            </div>

            {/* 2. Needs Attention & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Needs Attention (Priority List) */}
                <Card className="u-card lg:col-span-1">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Activity className="h-4 w-4 text-brand-primary" />
                            Needs Attention
                        </CardTitle>
                        <CardDescription>Items requiring immediate action</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {metrics.overdueCount > 0 && (
                            <Link href="/dashboard/payments?filter=overdue" className="block">
                                <div className="flex items-center justify-between p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900 shadow-sm hover:bg-rose-100/50 dark:hover:bg-rose-900/40 transition-colors cursor-pointer">
                                    <span className="text-sm font-medium text-foreground">Overdue Payments</span>
                                    <Badge variant="destructive" className="bg-rose-600 hover:bg-rose-700">{metrics.overdueCount}</Badge>
                                </div>
                            </Link>
                        )}
                        {metrics.pendingAllocations > 0 && (
                            <Link href="/dashboard/allocations/pending" className="block">
                                <div className="flex items-center justify-between p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900 shadow-sm hover:bg-amber-100/50 dark:hover:bg-amber-900/40 transition-colors cursor-pointer">
                                    <span className="text-sm font-medium text-foreground">Pending Approvals</span>
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800">
                                        {metrics.pendingAllocations}
                                    </Badge>
                                </div>
                            </Link>
                        )}
                        {metrics.failedMessages > 0 && (
                            <Link href="/dashboard/communications?filter=failed" className="block">
                                <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border shadow-sm hover:bg-accent/50 transition-colors cursor-pointer">
                                    <span className="text-sm font-medium text-foreground">Failed Messages</span>
                                    <Badge variant="outline" className="border-border text-foreground">{metrics.failedMessages}</Badge>
                                </div>
                            </Link>
                        )}
                        {metrics.overdueCount === 0 && metrics.pendingAllocations === 0 && metrics.failedMessages === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No urgent items.
                            </div>
                        )}
                        <Link href="/dashboard/allocations" className="block pt-2">
                            <Button variant="outline" className="w-full">View All Tasks</Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Sales Chart (Simplified) */}
                <Card className="u-card lg:col-span-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold">Money Received History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full" style={{ minHeight: '250px' }}>
                            {mounted ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--popover))',
                                                borderColor: 'hsl(var(--border))',
                                                color: 'hsl(var(--popover-foreground))',
                                                borderRadius: '8px'
                                            }}
                                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                        />
                                        <Bar dataKey="amount" fill="hsl(var(--brand-primary))" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                                    Loading chart...
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
