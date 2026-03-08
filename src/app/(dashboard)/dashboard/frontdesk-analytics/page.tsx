"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    FileCheck,
    AlertCircle,
    Users,
    Receipt,
    MessageSquareX,
    RefreshCw,
    Plus,
    CheckCircle,
} from "lucide-react";
import { getFrontdeskMetrics, type FrontdeskMetrics } from "@/lib/actions/analytics-actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function FrontdeskAnalyticsPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<FrontdeskMetrics | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => {
        if (profile) {
            loadMetrics();
            // Auto-refresh every 5 minutes
            const interval = setInterval(loadMetrics, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [profile]);

    async function loadMetrics() {
        setLoading(true);
        try {
            const { data, error } = await getFrontdeskMetrics();
            if (error) {
                toast.error(`Failed to load metrics: ${error}`);
            } else {
                setMetrics(data);
                setLastRefresh(new Date());
            }
        } catch (error: any) {
            console.error("Error loading frontdesk metrics:", error);
            toast.error("Failed to load frontdesk metrics");
        } finally {
            setLoading(false);
        }
    }

    // RBAC Check
    if (profileLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!profile || !["sysadmin", "ceo", "md", "frontdesk"].includes(profile.role)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Unauthorized Access</h1>
                    <p className="text-muted-foreground mt-2">
                        Only staff members can access frontdesk analytics.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Frontdesk Operations"
                description="Real-time operational metrics and quick actions"
                actions={
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Last refresh: {lastRefresh.toLocaleTimeString()}
                        </span>
                        <Button onClick={loadMetrics} disabled={loading} size="sm" variant="outline">
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                }
            />

            {/* Operational Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payments Today</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.payments_today_count || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(metrics?.payments_today_amount || 0)} collected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.pending_approvals_count || 0}</div>
                        <p className="text-xs text-muted-foreground">Allocations awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Installments</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {metrics?.overdue_installments_count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(metrics?.overdue_installments_amount || 0)} overdue
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Needs Follow-up</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.customers_needing_followup || 0}</div>
                        <p className="text-xs text-muted-foreground">Customers overdue &gt;7 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receipts Generated Today</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.receipts_generated_today || 0}</div>
                        <p className="text-xs text-muted-foreground">Payment receipts issued</p>
                    </CardContent>
                </Card>

                <Card className={metrics?.failed_messages_count ? "border-red-200 bg-red-50/10" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
                        <MessageSquareX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics?.failed_messages_count ? "text-red-600" : ""}`}>
                            {metrics?.failed_messages_count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">SMS/Email delivery failures today</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks for frontdesk operations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <Link href="/dashboard/payments/record">
                            <Button className="w-full gap-2" variant="default">
                                <Plus className="h-4 w-4" />
                                Record Payment
                            </Button>
                        </Link>
                        <Link href="/dashboard/allocations/pending">
                            <Button className="w-full gap-2" variant="outline">
                                <CheckCircle className="h-4 w-4" />
                                Approve Allocations
                            </Button>
                        </Link>
                        <Link href="/dashboard/customers?filter=overdue">
                            <Button className="w-full gap-2" variant="outline">
                                <AlertCircle className="h-4 w-4" />
                                View Overdue
                            </Button>
                        </Link>
                        <Link href="/dashboard/communications">
                            <Button className="w-full gap-2" variant="outline">
                                <MessageSquareX className="h-4 w-4" />
                                Send Reminders
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Operational Tips */}
            <Card>
                <CardHeader>
                    <CardTitle>Today's Focus</CardTitle>
                    <CardDescription>Recommended actions based on current metrics</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {(metrics?.pending_approvals_count || 0) > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <FileCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Review Pending Allocations</p>
                                    <p className="text-xs text-muted-foreground">
                                        {metrics?.pending_approvals_count || 0} allocation(s) awaiting approval
                                    </p>
                                </div>
                            </div>
                        )}

                        {(metrics?.customers_needing_followup || 0) > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Follow Up with Overdue Customers</p>
                                    <p className="text-xs text-muted-foreground">
                                        {metrics?.customers_needing_followup || 0} customer(s) overdue for more than 7 days
                                    </p>
                                </div>
                            </div>
                        )}

                        {(metrics?.failed_messages_count || 0) > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                                <MessageSquareX className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Check Failed Messages</p>
                                    <p className="text-xs text-muted-foreground">
                                        {metrics?.failed_messages_count || 0} message(s) failed to deliver today
                                    </p>
                                </div>
                            </div>
                        )}

                        {(metrics?.pending_approvals_count || 0) === 0 &&
                            (metrics?.customers_needing_followup || 0) === 0 &&
                            (metrics?.failed_messages_count || 0) === 0 && (
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm">All Clear!</p>
                                        <p className="text-xs text-muted-foreground">
                                            No urgent actions required at this time
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
