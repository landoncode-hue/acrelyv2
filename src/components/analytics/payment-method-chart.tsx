"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PaymentMethodData {
    payment_method: string;
    payment_count: number;
    total_revenue: number;
    avg_payment_amount: number;
}

interface PaymentMethodChartProps {
    data: PaymentMethodData[];
    loading?: boolean;
}

const methodLabels: Record<string, string> = {
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    cheque: "Cheque",
    pos: "POS",
    mobile_money: "Mobile Money",
    other: "Other",
};

export function PaymentMethodChart({ data, loading }: PaymentMethodChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Payment Method</CardTitle>
                    <CardDescription>Breakdown of revenue by payment type</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Payment Method</CardTitle>
                    <CardDescription>Breakdown of revenue by payment type</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        No payment data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = data.map((item) => ({
        method: methodLabels[item.payment_method] || item.payment_method,
        revenue: Number(item.total_revenue),
        count: item.payment_count,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Breakdown of revenue by payment type</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="method"
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                            className="text-xs"
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-3 shadow-md">
                                            <p className="font-medium">{payload[0].payload.method}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Revenue: {formatCurrency(payload[0].value as number)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Payments: {payload[0].payload.count}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (₦)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
