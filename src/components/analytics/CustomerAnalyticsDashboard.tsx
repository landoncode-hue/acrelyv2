"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users,
    TrendingUp,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";
import Link from "next/link";

interface CustomerMetrics {
    total_customers: number;
    active_customers: number;
    inactive_customers: number;
    customers_with_overdue: number;
    avg_customer_lifetime_value: number;
    payment_completion_rate: number;
}

interface OverdueCustomer {
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    estate_name: string;
    plot_number: string;
    overdue_amount: number;
    days_overdue: number;
}

export function CustomerAnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
    const [overdueCustomers, setOverdueCustomers] = useState<OverdueCustomer[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        setLoading(true);

        try {
            logger.info("Analytics fetch disabled");
        } catch (error) {
            logger.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load analytics data</p>
                    <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Customer Analytics</h2>
                <p className="text-muted-foreground">Overview of customer metrics and performance</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Customers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.total_customers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.active_customers} active, {metrics.inactive_customers} inactive
                        </p>
                    </CardContent>
                </Card>

                {/* Active Customers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {metrics.active_customers.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {((metrics.active_customers / metrics.total_customers) * 100).toFixed(1)}% of total
                        </p>
                    </CardContent>
                </Card>

                {/* Overdue Customers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers with Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {metrics.customers_with_overdue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Require immediate attention
                        </p>
                    </CardContent>
                </Card>

                {/* Average CLV */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₦{metrics.avg_customer_lifetime_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average lifetime investment
                        </p>
                    </CardContent>
                </Card>

                {/* Payment Completion Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payment Completion</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.payment_completion_rate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Customers fully paid
                        </p>
                    </CardContent>
                </Card>

                {/* Inactive Customers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">
                            {metrics.inactive_customers.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            May need re-engagement
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Top Customers */}
            {topCustomers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers by Investment</CardTitle>
                        <CardDescription>Highest value customers in your portfolio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCustomers.slice(0, 5).map((customer, index) => (
                                <div key={customer.customer_id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{customer.customer_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {customer.total_properties} {customer.total_properties === 1 ? 'property' : 'properties'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₦{customer.total_investment.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">
                                            ₦{customer.outstanding_balance.toLocaleString()} remaining
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Overdue Customers */}
            {overdueCustomers.length > 0 && (
                <Card className="border-orange-200">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-orange-600">Overdue Customers</CardTitle>
                                <CardDescription>Customers with overdue payments requiring attention</CardDescription>
                            </div>
                            <Badge variant="destructive">{overdueCustomers.length} Overdue</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {overdueCustomers.slice(0, 10).map((customer) => (
                                <div key={customer.customer_id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-100">
                                    <div>
                                        <p className="font-medium">{customer.customer_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {customer.estate_name} - Plot {customer.plot_number}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-orange-600">
                                            ₦{customer.overdue_amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {customer.days_overdue} days overdue
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/customers/${customer.customer_id}`}>
                                            View
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
