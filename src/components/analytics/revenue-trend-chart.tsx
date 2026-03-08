"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueTrendChartProps {
    data: Array<{
        period_label: string;
        total_revenue: number;
        payment_count?: number;
    }>;
    chartType?: "bar" | "line";
    title?: string;
    description?: string;
    loading?: boolean;
    height?: number;
}

export function RevenueTrendChart({
    data,
    chartType = "bar",
    title = "Revenue Trend",
    description = "Revenue over time",
    loading = false,
    height = 400,
}: RevenueTrendChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional for hydration handling
        setMounted(true);
    }, []);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className={`h-[${height}px] w-full`} />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                        <div className="text-center">
                            <p className="text-lg font-medium">No data available</p>
                            <p className="text-sm mt-1">
                                Revenue data will appear here once payments are recorded
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const Chart = chartType === "line" ? LineChart : BarChart;
    const DataComponent = chartType === "line" ? Line : Bar;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div style={{ height: `${height}px`, minHeight: `${height}px`, width: '100%' }}>
                    {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <Chart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="period_label"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) {
                                            return `₦${(value / 1000000).toFixed(1)}M`;
                                        }
                                        if (value >= 1000) {
                                            return `₦${(value / 1000).toFixed(0)}K`;
                                        }
                                        return `₦${value}`;
                                    }}
                                />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                Period
                                                            </span>
                                                            <span className="font-bold text-muted-foreground">
                                                                {payload[0].payload.period_label}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                Revenue
                                                            </span>
                                                            <span className="font-bold">
                                                                {formatCurrency(
                                                                    payload[0].payload.total_revenue
                                                                )}
                                                            </span>
                                                        </div>
                                                        {payload[0].payload.payment_count && (
                                                            <div className="flex flex-col col-span-2">
                                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                    Payments
                                                                </span>
                                                                <span className="font-bold text-muted-foreground">
                                                                    {payload[0].payload.payment_count}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {chartType === "bar" ? (
                                    <Bar
                                        dataKey="total_revenue"
                                        fill="#8b5cf6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                ) : (
                                    <Line
                                        dataKey="total_revenue"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                    />
                                )}
                            </Chart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Skeleton className="h-full w-full" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
