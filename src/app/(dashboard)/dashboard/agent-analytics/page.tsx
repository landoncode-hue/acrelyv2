"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversionFunnelChart } from "@/components/analytics/conversion-funnel-chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    TrendingUp,
    DollarSign,
    Target,
    Award,
    RefreshCw,
} from "lucide-react";
import {
    getAgentSelfMetrics,
    getAgentConversionFunnel,
    type AgentSelfMetrics,
    type ConversionFunnelStage,
} from "@/lib/actions/analytics-actions";
import { formatCurrency } from "@/lib/utils";
import { getDateRangePresets } from "@/lib/utils/analytics-utils";
import { toast } from "sonner";

export default function AgentAnalyticsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [dateRange, setDateRange] = useState<"today" | "thisMonth" | "thisYear">("thisMonth");
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<AgentSelfMetrics | null>(null);
    const [funnelData, setFunnelData] = useState<ConversionFunnelStage[]>([]);

    useEffect(() => {
        if (profile) {
            loadMetrics();
        }
    }, [profile, dateRange]);

    async function loadMetrics() {
        setLoading(true);
        try {
            const presets = getDateRangePresets();
            const range = presets[dateRange];
            const dateFrom = range.from.toISOString();
            const dateTo = range.to.toISOString();

            const [metricsRes, funnelRes] = await Promise.all([
                getAgentSelfMetrics(),
                getAgentConversionFunnel(undefined, dateFrom, dateTo),
            ]);

            if (metricsRes.data) setMetrics(metricsRes.data);
            if (funnelRes.data) setFunnelData(funnelRes.data);

            if (metricsRes.error) toast.error(`Metrics: ${metricsRes.error}`);
            if (funnelRes.error) toast.error(`Funnel: ${funnelRes.error}`);
        } catch (error: any) {
            console.error("Error loading agent metrics:", error);
            toast.error("Failed to load agent metrics");
        } finally {
            setLoading(false);
        }
    }

    // RBAC Check
    if (profileLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!profile || !["agent", "sysadmin", "ceo", "md"].includes(profile.role)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Unauthorized Access</h1>
                    <p className="text-muted-foreground mt-2">
                        Only agents can access this dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="My Performance"
                description="Track your leads, conversions, and commission"
                actions={
                    <div className="flex items-center gap-4">
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
                    </div>
                }
            />

            {/* Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.total_leads || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics?.new_leads || 0} new leads
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {metrics?.converted_leads || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {metrics?.conversion_rate.toFixed(1) || 0}% conversion rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(metrics?.total_revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {metrics?.total_allocations || 0} allocations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(metrics?.commission_total || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(metrics?.commission_pending || 0)} pending
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Lead Status Breakdown */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.new_leads || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Contacted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.contacted_leads || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.qualified_leads || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Converted</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {metrics?.converted_leads || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Funnel */}
            <ConversionFunnelChart
                data={funnelData}
                loading={loading}
                title="My Conversion Funnel"
                description={`Lead progression for ${dateRange === "today" ? "today" : dateRange === "thisMonth" ? "this month" : "this year"}`}
            />

            {/* Commission Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Commission Summary</CardTitle>
                    <CardDescription>Your earnings breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Commission</span>
                            <span className="text-lg font-bold">
                                {formatCurrency(metrics?.commission_total || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Paid</span>
                            <span className="text-sm font-medium text-green-600">
                                {formatCurrency(metrics?.commission_paid || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pending</span>
                            <span className="text-sm font-medium text-orange-600">
                                {formatCurrency(metrics?.commission_pending || 0)}
                            </span>
                        </div>
                        <div className="pt-4 border-t">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-600 transition-all"
                                    style={{
                                        width: `${metrics?.commission_total
                                            ? (metrics.commission_paid / metrics.commission_total) * 100
                                            : 0
                                            }%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {metrics?.commission_total
                                    ? ((metrics.commission_paid / metrics.commission_total) * 100).toFixed(1)
                                    : 0}
                                % of commission paid
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                    <CardDescription>Tips to improve your conversion rate</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {(metrics?.conversion_rate || 0) < 10 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                                <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Improve Conversion Rate</p>
                                    <p className="text-xs text-muted-foreground">
                                        Your conversion rate is {metrics?.conversion_rate.toFixed(1)}%. Focus on
                                        qualifying leads better and following up consistently.
                                    </p>
                                </div>
                            </div>
                        )}

                        {(metrics?.new_leads || 0) > 5 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Contact New Leads</p>
                                    <p className="text-xs text-muted-foreground">
                                        You have {metrics?.new_leads} new leads. Reach out within 24 hours for best
                                        results.
                                    </p>
                                </div>
                            </div>
                        )}

                        {(metrics?.conversion_rate || 0) >= 20 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                <Award className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Great Performance!</p>
                                    <p className="text-xs text-muted-foreground">
                                        Your {metrics?.conversion_rate.toFixed(1)}% conversion rate is excellent. Keep
                                        up the great work!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
