"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface CustomerLifecycleData {
    customer_status: string;
    count: number;
    total_lifetime_value: number;
    avg_outstanding_balance: number;
}

interface CustomerLifecycleChartProps {
    data: CustomerLifecycleData[];
    loading?: boolean;
}

const statusLabels: Record<string, string> = {
    active: "Active",
    completed: "Completed",
    overdue: "Overdue",
    inactive: "Inactive",
};

const statusColors: Record<string, string> = {
    active: "hsl(var(--chart-2))",
    completed: "hsl(142, 76%, 36%)",
    overdue: "hsl(var(--destructive))",
    inactive: "hsl(var(--muted))",
};

export function CustomerLifecycleChart({ data, loading }: CustomerLifecycleChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Customer Status Distribution</CardTitle>
                    <CardDescription>Breakdown of customers by lifecycle status</CardDescription>
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
                    <CardTitle>Customer Status Distribution</CardTitle>
                    <CardDescription>Breakdown of customers by lifecycle status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        No customer data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = data.map((item) => ({
        name: statusLabels[item.customer_status] || item.customer_status,
        value: Number(item.count),
        lifetimeValue: Number(item.total_lifetime_value),
        avgBalance: Number(item.avg_outstanding_balance),
        status: item.customer_status,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Status Distribution</CardTitle>
                <CardDescription>Breakdown of customers by lifecycle status</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={statusColors[entry.status] || "hsl(var(--muted))"} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-background p-3 shadow-md">
                                            <p className="font-medium">{data.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Customers: {data.value}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Total Value: {formatCurrency(data.lifetimeValue)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Avg Balance: {formatCurrency(data.avgBalance)}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
