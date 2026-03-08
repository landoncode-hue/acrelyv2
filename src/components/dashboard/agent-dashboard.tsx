"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "./kpi-card";
import { PipelineBoard } from "./pipeline-board";
import {
    Wallet,
    Users,
    Phone,
    UserPlus,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

import { getAgentSelfMetrics, type AgentSelfMetrics } from "@/lib/actions/analytics-actions";
import { WithdrawalRequestDialog } from "./withdrawal-request-dialog";

const safeCurrency = (val: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val);

export function AgentDashboard({ profile, initialData }: { profile: any, initialData?: { metrics: AgentSelfMetrics | null } }) {
    const [metrics, setMetrics] = useState({
        commission: initialData?.metrics?.wallet_balance || 0, // Use wallet balance
        totalEarned: initialData?.metrics?.commission_total || 0, // Keep track of total earned separately
        leadsAssigned: initialData?.metrics?.total_leads || 0,
        totalSales: initialData?.metrics?.total_allocations || 0,
        leadsContacted: initialData?.metrics?.contacted_leads || 0,
    });

    const [pipelineLeads, setPipelineLeads] = useState<any[]>([]);
    const [leadsLoading, setLeadsLoading] = useState(true);

    useEffect(() => {
        // Load agent metrics and leads
        async function loadDashboardData() {
            setLeadsLoading(true);

            // 1. Fetch Metrics
            if (!initialData) {
                const { data } = await getAgentSelfMetrics(profile.id);
                if (data) {
                    setMetrics({
                        commission: data.wallet_balance, // Use wallet balance
                        totalEarned: data.commission_total,
                        leadsAssigned: data.total_leads,
                        totalSales: data.total_allocations,
                        leadsContacted: data.contacted_leads,
                    });
                }
            }

            // 2. Fetch Leads for Pipeline
            setPipelineLeads([]);
            setLeadsLoading(false);
        }

        loadDashboardData();
    }, [profile.id]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader title={`Hello, ${profile.full_name?.split(' ')[0]}`} description="Let's close some deals today." />

            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Balance Card - Distinct Visual */}
                <div className="md:col-span-1 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 shadow-xl relative overflow-hidden">
                    {/* Abstract Decoration */}
                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-white/10" />

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-2 opacity-90">
                            <Wallet className="h-5 w-5" />
                            <span className="text-sm font-medium">Commission Balance</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{safeCurrency(metrics.commission)}</h2>
                            <p className="text-xs opacity-75 mt-1">Available Balance (Total Earned: {safeCurrency(metrics.totalEarned)})</p>
                        </div>
                        <WithdrawalRequestDialog balance={metrics.commission} />
                    </div>
                </div>

                {/* Smaller Stats */}
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                    <KpiCard
                        title="My Active Leads"
                        value={metrics.leadsAssigned}
                        icon={Users}
                        description="In your pipeline"
                    />
                    <KpiCard
                        title="Total Sales"
                        value={metrics.totalSales}
                        icon={ArrowUpRight}
                        description="Allocations closed"
                        trend={{ value: metrics.totalSales > 0 ? 100 : 0, label: "Growth", positive: true }}
                    />
                    <KpiCard
                        title="Contacted Today"
                        value={metrics.leadsContacted}
                        icon={Phone}
                        description="Outbound calls/msgs"
                        trend={{ value: 12, label: "Daily goal hit", positive: true }}
                    />
                </div>
            </div>

            {/* Pipeline Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Lead Pipeline</h3>
                        <p className="text-sm text-muted-foreground">Manage your deals.</p>
                    </div>
                    <Button className="gap-2" asChild>
                        <Link href="/dashboard/leads/new">
                            <UserPlus className="h-4 w-4" /> Add New Lead
                        </Link>
                    </Button>
                </div>

                <div className="bg-muted/30 p-4 -mx-4 sm:mx-0 rounded-xl border border-dashed">
                    <PipelineBoard leads={pipelineLeads} />
                </div>
            </div>
        </div>
    );
}
