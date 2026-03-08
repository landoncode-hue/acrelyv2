"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    BarChart3
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface AllocationMetrics {
    total_allocations: number;
    pending_approvals: number;
    approved_allocations: number;
    completed_allocations: number;
    cancelled_allocations: number;
    total_revenue: number;
    total_outstanding: number;
    avg_time_to_approval: string;
}

interface EstateRevenue {
    estate_id: string;
    estate_name: string;
    total_allocations: number;
    approved_allocations: number;
    completed_allocations: number;
    total_revenue: number;
    outstanding_balance: number;
    completion_rate: number;
}

interface ConversionRate {
    drafts_created: number;
    pending_approvals: number;
    approved: number;
    completed: number;
    cancelled: number;
    draft_to_approval_rate: number;
    approval_to_completion_rate: number;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatInterval(interval: string) {
    if (!interval) return 'N/A';
    const match = interval.match(/(\d+)\s*days?/);
    if (match) return `${match[1]} days`;
    return interval;
}

export default function AllocationAnalyticsClient({
    metrics,
    estateRevenue,
    conversion
}: {
    metrics: AllocationMetrics | null;
    estateRevenue: EstateRevenue[];
    conversion: ConversionRate | null;
}) {

    const statusData = [
        { name: 'Pending', value: metrics?.pending_approvals || 0, color: COLORS[3] },
        { name: 'Approved', value: metrics?.approved_allocations || 0, color: COLORS[1] },
        { name: 'Completed', value: metrics?.completed_allocations || 0, color: COLORS[2] },
        { name: 'Cancelled', value: metrics?.cancelled_allocations || 0, color: COLORS[4] }
    ];

    const topEstates = estateRevenue.slice(0, 5);

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold">Allocation Analytics</h1>
                <p className="text-muted-foreground">Comprehensive allocation metrics and insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.total_allocations || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All time allocations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{metrics?.pending_approvals || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(metrics?.total_revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Payments received
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(metrics?.total_outstanding || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Expected payments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Conversion Metrics */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Funnel</CardTitle>
                        <CardDescription>Allocation lifecycle progression</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Drafts Created</span>
                            <Badge variant="outline">{conversion?.drafts_created || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Pending Approval</span>
                            <Badge variant="outline">{conversion?.pending_approvals || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Approved</span>
                            <Badge variant="secondary">{conversion?.approved || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Completed</span>
                            <Badge className="bg-green-600">{conversion?.completed || 0}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Cancelled</span>
                            <Badge variant="destructive">{conversion?.cancelled || 0}</Badge>
                        </div>
                        <div className="pt-4 border-t space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Draft → Approval Rate</span>
                                <span className="text-sm font-bold text-green-600">
                                    {conversion?.draft_to_approval_rate?.toFixed(1) || 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Approval → Completion Rate</span>
                                <span className="text-sm font-bold text-blue-600">
                                    {conversion?.approval_to_completion_rate?.toFixed(1) || 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status Distribution</CardTitle>
                        <CardDescription>Allocation status breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Estate Revenue */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Estates by Revenue</CardTitle>
                    <CardDescription>Revenue performance by estate</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topEstates}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="estate_name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Legend />
                            <Bar dataKey="total_revenue" fill={COLORS[0]} name="Total Revenue" />
                            <Bar dataKey="outstanding_balance" fill={COLORS[3]} name="Outstanding" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Estate Details Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Estate Performance Details</CardTitle>
                    <CardDescription>Detailed breakdown by estate</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="p-3 text-left">Estate</th>
                                    <th className="p-3 text-right">Allocations</th>
                                    <th className="p-3 text-right">Completed</th>
                                    <th className="p-3 text-right">Revenue</th>
                                    <th className="p-3 text-right">Outstanding</th>
                                    <th className="p-3 text-right">Completion %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estateRevenue.map((estate) => (
                                    <tr key={estate.estate_id} className="border-t">
                                        <td className="p-3 font-medium">{estate.estate_name}</td>
                                        <td className="p-3 text-right">{estate.total_allocations}</td>
                                        <td className="p-3 text-right">{estate.completed_allocations}</td>
                                        <td className="p-3 text-right text-green-600 font-medium">
                                            {formatCurrency(estate.total_revenue)}
                                        </td>
                                        <td className="p-3 text-right text-orange-600">
                                            {formatCurrency(estate.outstanding_balance)}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Badge variant={estate.completion_rate > 50 ? "default" : "secondary"}>
                                                {estate.completion_rate.toFixed(1)}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Time to Approval</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatInterval(metrics?.avg_time_to_approval || '')}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From draft to approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {conversion?.approval_to_completion_rate?.toFixed(1) || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Approved → Completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {metrics?.total_allocations
                                ? ((metrics.cancelled_allocations / metrics.total_allocations) * 100).toFixed(1)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Of all allocations
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
