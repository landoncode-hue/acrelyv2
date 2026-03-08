"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PlanTypeData {
    plan_type: string;
    allocation_count: number;
    total_revenue: number;
    collection_rate_percentage: number;
}

interface PlanTypeChartProps {
    data: PlanTypeData[];
    loading?: boolean;
}

const planLabels: Record<string, string> = {
    outright: "Outright",
    "3_months": "3 Months",
    "6_months": "6 Months",
    "12_months": "12 Months",
};

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
];

export function PlanTypeChart({ data, loading }: PlanTypeChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Payment Plan</CardTitle>
                    <CardDescription>Distribution of revenue across payment plans</CardDescription>
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
                    <CardTitle>Revenue by Payment Plan</CardTitle>
                    <CardDescription>Distribution of revenue across payment plans</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        No plan data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = data.map((item) => ({
        name: planLabels[item.plan_type] || item.plan_type,
        value: Number(item.total_revenue),
        count: item.allocation_count,
        collectionRate: Number(item.collection_rate_percentage),
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Revenue by Payment Plan</CardTitle>
                <CardDescription>Distribution of revenue across payment plans</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                                Revenue: {formatCurrency(data.value)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Allocations: {data.count}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Collection Rate: {data.collectionRate.toFixed(1)}%
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
