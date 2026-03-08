"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "./kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Users,
    FileText,
    CreditCard,
    AlertTriangle,
    Plus,
    UserPlus,
    FilePlus,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { getFrontdeskMetrics, type FrontdeskMetrics } from "@/lib/actions/analytics-actions";

// Helper for safe currency formatting if utils fail
const safeCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

export function FrontDeskDashboard({ profile, initialData }: { profile: any, initialData?: { metrics: FrontdeskMetrics | null } }) {
    const [loading, setLoading] = useState(!initialData);
    const [metrics, setMetrics] = useState<FrontdeskMetrics | null>(initialData?.metrics || null);
    const [recentLeads, setRecentLeads] = useState<any[]>([]);
    const [recentPayments, setRecentPayments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('leads');

    useEffect(() => {
        async function loadData() {
            // Only show loader if we didn't start with data
            if (!initialData) setLoading(true);

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayIso = todayStart.toISOString();

            // Load metrics only if not provided initially
            if (!initialData) {
                const { data: metricsData } = await getFrontdeskMetrics(todayIso);
                if (metricsData) {
                    setMetrics(metricsData);
                }
            }


            // Fetch Recent Leads (Client-side for freshness)
            const leads: any[] = [];

            // Fetch Recent Payments (Client-side for freshness)
            const payments: any[] = [];

            if (leads) setRecentLeads(leads);
            if (payments) setRecentPayments(payments);

            setLoading(false);
        }
        loadData();
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title={`Welcome back, ${profile.full_name?.split(' ')[0]}`}
                description="Operational overview for today."
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="New Leads"
                    value={metrics?.customers_needing_followup || 0}
                    icon={Users}
                    description="Needs attention"
                />
                <KpiCard
                    title="Pending Approvals"
                    value={metrics?.pending_approvals_count || 0}
                    icon={FileText}
                    description="Allocations awaiting approval"
                />
                <KpiCard
                    title="Payments Today"
                    value={safeCurrency(metrics?.payments_today_amount || 0)}
                    icon={CreditCard}
                    description={`${metrics?.payments_today_count || 0} transactions`}
                />
                <KpiCard
                    title="Overdue Installments"
                    value={metrics?.overdue_installments_count || 0}
                    icon={AlertTriangle}
                    description={safeCurrency(metrics?.overdue_installments_amount || 0)}
                />
            </div>

            {/* Additional Operational Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Receipts Generated Today</CardTitle>
                        <CardDescription>Payment receipts issued</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{metrics?.receipts_generated_today || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Failed Messages</CardTitle>
                        <CardDescription>SMS/Email delivery issues</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            {metrics?.failed_messages_count || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Follow-ups Needed</CardTitle>
                        <CardDescription>Customers overdue &gt; 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                            {metrics?.customers_needing_followup || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Quick Actions Panel */}
                <div className="md:col-span-3 lg:col-span-1 space-y-4">
                    <h3 className="text-lg font-semibold -mb-2 px-1">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                        <ActionButton
                            href="/dashboard/leads/new"
                            icon={UserPlus}
                            label="New Lead"
                            sublabel="Register inquiry"
                            color="bg-primary"
                        />
                        <ActionButton
                            href="/dashboard/allocations/new"
                            icon={FilePlus}
                            label="New Allocation"
                            sublabel="Start sales process"
                            color="bg-purple-600"
                        />
                        <ActionButton
                            href="/dashboard/payments/new"
                            icon={CreditCard}
                            label="Record Payment"
                            sublabel="Log transaction"
                            color="bg-emerald-600"
                        />
                    </div>
                </div>

                {/* Table Previews */}
                <div className="md:col-span-3 lg:col-span-2">
                    <Tabs defaultValue="leads" onValueChange={(value) => setActiveTab(value)} className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList>
                                <TabsTrigger value="leads">Recent Leads</TabsTrigger>
                                <TabsTrigger value="payments">Recent Payments</TabsTrigger>
                            </TabsList>
                            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" asChild>
                                <Link href={activeTab === 'payments' ? '/dashboard/payments' : '/dashboard/leads'}>
                                    View Full List <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <TabsContent value="leads" className="mt-0">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {recentLeads.map(lead => (
                                            <div key={lead.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                                <div>
                                                    <p className="font-medium text-sm">{lead.first_name} {lead.last_name}</p>
                                                    <p className="text-xs text-muted-foreground">{lead.email || lead.phone}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                                                        {lead.status}
                                                    </span>
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/dashboard/leads/${lead.id}`}>View</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {recentLeads.length === 0 && (
                                            <EmptyState
                                                icon={UserPlus}
                                                title="No Recent Leads"
                                                description="No leads have been added recently."
                                                actionLabel="Add New Lead"
                                                actionHref="/dashboard/leads/new"
                                                className="py-12"
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payments" className="mt-0">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y">
                                        {recentPayments.map(payment => (
                                            <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                                <div>
                                                    <p className="font-medium text-sm">{payment.profiles?.full_name || 'Unknown Payer'}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-sm">
                                                        +{safeCurrency(payment.amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {recentPayments.length === 0 && (
                                            <EmptyState
                                                icon={CreditCard}
                                                title="No Recent Payments"
                                                description="No payments have been recorded today yet."
                                                actionLabel="Record Payment"
                                                actionHref="/dashboard/payments/new"
                                                className="py-12"
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function ActionButton({ href, icon: Icon, label, sublabel, color }: any) {
    return (
        <Link href={href} className="group block h-full">
            <div className={`
                relative overflow-hidden rounded-xl p-4 h-full
                border border-border bg-card text-card-foreground
                transition-all duration-200
                hover:shadow-md hover:border-primary/20 hover:bg-accent/50
            `}>
                <div className="relative z-10 flex flex-row items-center gap-4">
                    <div className={`rounded-lg p-2.5 text-white shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0 ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base leading-none mb-1 group-hover:text-primary transition-colors">{label}</h3>
                        <p className="text-xs text-muted-foreground">{sublabel}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3 lg:col-span-1 space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="md:col-span-3 lg:col-span-2 h-[400px] rounded-xl" />
            </div>
        </div>
    )
}
