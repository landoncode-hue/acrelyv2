"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { logger } from "@/lib/logger";
import { PageHeader } from "@/components/layout/page-header";
import { AnalyticsCustomizer, useAnalyticsWidgets } from "@/components/analytics/analytics-customizer";
import { AnalyticsKPICard } from "@/components/analytics/analytics-kpi-card";
import { RevenueTrendChart } from "@/components/analytics/revenue-trend-chart";
import { PaymentMethodChart } from "@/components/analytics/payment-method-chart";
import { PlanTypeChart } from "@/components/analytics/plan-type-chart";
import { CustomerLifecycleChart } from "@/components/analytics/customer-lifecycle-chart";
import { ConversionFunnelChart } from "@/components/analytics/conversion-funnel-chart";
import { ExportButton } from "@/components/analytics/export-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DollarSign,
    TrendingUp,
    Home,
    Users,
    AlertCircle,
    Activity,
    Building2,
    BarChart3,
} from "lucide-react";
import {
    getExecutiveKPIs,
    getRevenueTrends,
    getCustomerAnalytics,
    getInventoryAnalytics,
    getAgentPerformanceSummary,
    getRevenueByPaymentMethod,
    getRevenueByPlanType,
    getCustomerLifecycleData,
    getAgentConversionFunnel,
    logAnalyticsAccess,
    type ExecutiveKPIs,
    type RevenueTrend,
    type CustomerAnalytics,
    type InventoryAnalytics,
    type AgentPerformance,
    type RevenueByPaymentMethod,
    type RevenueByPlanType,
    type CustomerLifecycleData,
    type ConversionFunnelStage,
} from "@/lib/actions/analytics-actions";
import { exportPaymentsReportAction } from "@/lib/actions/export-actions";
import { exportToCSV } from "@/lib/utils/csv-utils";
import { formatCurrency } from "@/lib/utils";
import { getDateRangePresets } from "@/lib/utils/analytics-utils";
import { toast } from "sonner";

export default function AnalyticsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [dateRange, setDateRange] = useState<"today" | "thisMonth" | "thisYear">("thisMonth");
    const [loading, setLoading] = useState(true);

    // State for analytics data
    const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
    const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
    const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
    const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics[]>([]);
    const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
    const [paymentMethodData, setPaymentMethodData] = useState<RevenueByPaymentMethod[]>([]);
    const [planTypeData, setPlanTypeData] = useState<RevenueByPlanType[]>([]);
    const [customerLifecycleData, setCustomerLifecycleData] = useState<CustomerLifecycleData[]>([]);
    const [conversionFunnelData, setConversionFunnelData] = useState<ConversionFunnelStage[]>([]);

    useEffect(() => {
        if (profile) {
            loadAnalytics();
            // Log analytics access
            logAnalyticsAccess("executive", { dateRange });
        }
    }, [profile, dateRange]);

    async function loadAnalytics() {
        setLoading(true);
        try {
            const presets = getDateRangePresets();
            const range = presets[dateRange];
            const dateFrom = range.from.toISOString();
            const dateTo = range.to.toISOString();

            // Load all analytics data in parallel
            const [
                kpisRes,
                trendsRes,
                customerRes,
                inventoryRes,
                agentRes,
                paymentMethodRes,
                planTypeRes,
                lifecycleRes,
                funnelRes,
            ] = await Promise.all([
                getExecutiveKPIs(dateFrom, dateTo),
                getRevenueTrends("monthly", dateFrom, dateTo),
                getCustomerAnalytics(dateFrom, dateTo),
                getInventoryAnalytics(),
                getAgentPerformanceSummary(dateFrom, dateTo),
                getRevenueByPaymentMethod(),
                getRevenueByPlanType(),
                getCustomerLifecycleData(),
                getAgentConversionFunnel(undefined, dateFrom, dateTo),
            ]);

            if (kpisRes.success && kpisRes.data) setKpis(kpisRes.data);
            if (trendsRes.success && trendsRes.data) setRevenueTrends(trendsRes.data);
            if (customerRes.success && customerRes.data) setCustomerAnalytics(customerRes.data);
            if (inventoryRes.success && inventoryRes.data) setInventoryAnalytics(inventoryRes.data);
            if (agentRes.success && agentRes.data) setAgentPerformance(agentRes.data);
            if (paymentMethodRes.success && paymentMethodRes.data) setPaymentMethodData(paymentMethodRes.data);
            if (planTypeRes.success && planTypeRes.data) setPlanTypeData(planTypeRes.data);
            if (lifecycleRes.success && lifecycleRes.data) setCustomerLifecycleData(lifecycleRes.data);
            if (funnelRes.success && funnelRes.data) setConversionFunnelData(funnelRes.data);

            // Handle errors
            if (kpisRes.error) toast.error(`KPIs: ${kpisRes.error.message}`);
            if (trendsRes.error) toast.error(`Revenue Trends: ${trendsRes.error.message}`);
            if (customerRes.error) toast.error(`Customer Analytics: ${customerRes.error.message}`);
            if (inventoryRes.error) toast.error(`Inventory Analytics: ${inventoryRes.error.message}`);
            if (agentRes.error) toast.error(`Agent Performance: ${agentRes.error.message}`);
        } catch (error: any) {
            logger.error("Error loading analytics:", error);
            toast.error("Failed to load analytics data");
        } finally {
            setLoading(false);
        }
    }

    async function handleExportPayments() {
        const presets = getDateRangePresets();
        const range = presets[dateRange];
        const dateFrom = range.from.toISOString();
        const dateTo = range.to.toISOString();

        const response = await exportPaymentsReportAction(dateFrom, dateTo, 5000);

        if (response.error) {
            toast.error(typeof response.error === "string" ? response.error : "Export failed");
            return;
        }

        if (response.data && response.data.length > 0) {
            exportToCSV(response.data, `payments_${dateRange}_${new Date().toISOString().split("T")[0]}.csv`);
        } else {
            toast.info("No data to export for the selected period");
        }
    }

    const { visibleWidgets, toggleWidget, mounted } = useAnalyticsWidgets();

    // RBAC Check
    if (profileLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!profile || !["sysadmin", "ceo", "md"].includes(profile.role)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Unauthorized Access</h1>
                    <p className="text-muted-foreground mt-2">
                        Only CEO, MD, or SysAdmin can access executive analytics.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Executive Analytics"
                description="Comprehensive business performance metrics and insights"
                actions={
                    <div className="flex items-center gap-4">
                        <AnalyticsCustomizer visibleWidgets={visibleWidgets} toggleWidget={toggleWidget} />
                        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="thisMonth">This Month</SelectItem>
                                <SelectItem value="thisYear">This Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <ExportButton onExport={handleExportPayments} label="Export Payments" />
                    </div>
                }
            />

            {/* KPI Cards */}
            {(visibleWidgets.kpi_financials || visibleWidgets.kpi_operations || visibleWidgets.kpi_customers) && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {visibleWidgets.kpi_financials && (
                        <>
                            <AnalyticsKPICard
                                title="Total Revenue"
                                value={formatCurrency(kpis?.total_revenue_collected || 0)}
                                icon={DollarSign}
                                description="Verified payments collected"
                                loading={loading}
                                tooltip="Total revenue from all verified payments in the selected period"
                            />
                            <AnalyticsKPICard
                                title="Outstanding Balance"
                                value={formatCurrency(kpis?.outstanding_balance || 0)}
                                icon={TrendingUp}
                                description="Expected receivables"
                                loading={loading}
                                tooltip="Total outstanding balance from all active allocations"
                            />
                        </>
                    )}
                    {visibleWidgets.kpi_operations && (
                        <>
                            <AnalyticsKPICard
                                title="Plots Sold"
                                value={kpis?.plots_sold || 0}
                                icon={Home}
                                description="Approved allocations"
                                loading={loading}
                                tooltip="Number of plots sold in the selected period"
                            />
                            <AnalyticsKPICard
                                title="Active Allocations"
                                value={kpis?.active_allocations || 0}
                                icon={BarChart3}
                                description="Currently active"
                                loading={loading}
                                tooltip="Number of allocations currently in approved status"
                            />
                        </>
                    )}
                    {visibleWidgets.kpi_customers && (
                        <>
                            <AnalyticsKPICard
                                title="Overdue Customers"
                                value={kpis?.overdue_customers || 0}
                                icon={AlertCircle}
                                description="Needs follow-up"
                                loading={loading}
                                className="border-orange-200 bg-orange-50/10"
                                tooltip="Customers with overdue installments"
                            />
                            <AnalyticsKPICard
                                title="Agent Performance"
                                value={`${kpis?.agent_performance_index?.toFixed(1) || 0}%`}
                                icon={Activity}
                                description="Avg conversion rate"
                                loading={loading}
                                tooltip="Average conversion rate across all agents"
                            />
                            <AnalyticsKPICard
                                title="Total Customers"
                                value={kpis?.total_customers || 0}
                                icon={Users}
                                description="All customers"
                                loading={loading}
                            />
                            <AnalyticsKPICard
                                title="Total Estates"
                                value={kpis?.total_estates || 0}
                                icon={Building2}
                                description="Active estates"
                                loading={loading}
                            />
                        </>
                    )}
                </div>
            )}


            {/* Tabs for different analytics sections */}
            <Tabs defaultValue="revenue" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                </TabsList>

                <TabsContent value="revenue" className="space-y-4">
                    {visibleWidgets.chart_revenue && (
                        <RevenueTrendChart
                            data={revenueTrends}
                            title="Revenue Trend"
                            description="Monthly revenue performance"
                            loading={loading}
                        />
                    )}

                    {visibleWidgets.chart_breakdowns && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <PaymentMethodChart data={paymentMethodData} loading={loading} />
                            <PlanTypeChart data={planTypeData} loading={loading} />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Customers</CardTitle>
                                <CardDescription>Currently active accounts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {customerAnalytics?.active_customers || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Completed Customers</CardTitle>
                                <CardDescription>Fully paid accounts</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {customerAnalytics?.completed_customers || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Avg Lifetime Value</CardTitle>
                                <CardDescription>Per customer</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {formatCurrency(customerAnalytics?.avg_lifetime_value || 0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <CustomerLifecycleChart data={customerLifecycleData} loading={loading} />
                        <ConversionFunnelChart data={conversionFunnelData} loading={loading} />
                    </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estate Occupancy</CardTitle>
                            <CardDescription>Plot availability by estate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {inventoryAnalytics.map((estate) => (
                                    <div key={estate.estate_id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{estate.estate_name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {estate.occupancy_percentage.toFixed(1)}% occupied
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${estate.occupancy_percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{estate.sold_plots} sold</span>
                                            <span>{estate.available_plots} available</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="agents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agent Performance</CardTitle>
                            <CardDescription>Top performing agents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-3 text-left">Agent</th>
                                            <th className="p-3 text-right">Leads</th>
                                            <th className="p-3 text-right">Conversions</th>
                                            <th className="p-3 text-right">Rate</th>
                                            <th className="p-3 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agentPerformance.slice(0, 10).map((agent) => (
                                            <tr key={agent.agent_id} className="border-t">
                                                <td className="p-3 font-medium">{agent.agent_name}</td>
                                                <td className="p-3 text-right">{agent.total_leads}</td>
                                                <td className="p-3 text-right">{agent.converted_leads}</td>
                                                <td className="p-3 text-right">
                                                    {agent.conversion_rate.toFixed(1)}%
                                                </td>
                                                <td className="p-3 text-right font-medium text-green-600">
                                                    {formatCurrency(agent.total_revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
