"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    TrendingUp,
    DollarSign,
    CreditCard,
    AlertTriangle,
    Users,
    Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentAnalyticsClientProps {
    stats: any;
    methodBreakdown: any[];
    revenueByMonth: any[];
    overdueInstallments: any[];
    topCustomers: any[];
    collectionRate: any;
}

export function PaymentAnalyticsClient({
    stats,
    methodBreakdown,
    revenueByMonth,
    overdueInstallments,
    topCustomers,
    collectionRate
}: PaymentAnalyticsClientProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Payment Analytics"
                description="Comprehensive payment insights and reporting"
            />

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_payments || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.verified_count || 0} verified, {stats?.reversed_count || 0} reversed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(stats?.total_amount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Avg: {formatCurrency(stats?.average_payment || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {collectionRate?.collection_rate?.toFixed(1) || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatCurrency(collectionRate?.total_collected || 0)} collected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(collectionRate?.outstanding_balance || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {overdueInstallments.length} overdue installments
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Payment Method Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {methodBreakdown.map((method) => (
                                <div key={method.payment_method} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="capitalize font-medium">
                                            {method.payment_method?.replace('_', ' ')}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {method.count} payments
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 bg-zinc-100 rounded-full h-2 mr-4">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: `${method.percentage || 0}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold min-w-[100px] text-right">
                                            {formatCurrency(method.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {methodBreakdown.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">
                                    No payment data available
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Revenue */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Revenue (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {revenueByMonth.map((month) => (
                                <div key={month.month_year} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{month.month_year}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold">
                                            {formatCurrency(month.total_revenue)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {month.payment_count} payments
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {revenueByMonth.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">
                                    No revenue data available
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Paying Customers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Top Paying Customers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Total Paid</TableHead>
                                <TableHead className="text-right">Payments</TableHead>
                                <TableHead className="text-right">Properties</TableHead>
                                <TableHead className="text-right">Last Payment</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topCustomers.map((customer) => (
                                <TableRow key={customer.customer_id}>
                                    <TableCell className="font-medium">{customer.customer_name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {customer.customer_email}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">
                                        {formatCurrency(customer.total_paid)}
                                    </TableCell>
                                    <TableCell className="text-right">{customer.payment_count}</TableCell>
                                    <TableCell className="text-right">{customer.properties_count}</TableCell>
                                    <TableCell className="text-right text-sm">
                                        {new Date(customer.last_payment_date).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {topCustomers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No customer data available
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Overdue Installments */}
            {overdueInstallments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Overdue Installments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Installment</TableHead>
                                    <TableHead className="text-right">Due Date</TableHead>
                                    <TableHead className="text-right">Days Overdue</TableHead>
                                    <TableHead className="text-right">Outstanding</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overdueInstallments.map((item) => (
                                    <TableRow key={item.installment_id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{item.customer_name}</div>
                                                <div className="text-xs text-muted-foreground">{item.customer_phone}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {item.estate_name} - Plot {item.plot_number}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">#{item.installment_number}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {new Date(item.due_date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="destructive">{item.days_overdue} days</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-orange-600">
                                            {formatCurrency(item.outstanding_amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
