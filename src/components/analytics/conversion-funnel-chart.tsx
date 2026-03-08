"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversionFunnelStage {
    stage: string;
    count: number;
    percentage: number;
}

interface ConversionFunnelChartProps {
    data: ConversionFunnelStage[];
    loading?: boolean;
    title?: string;
    description?: string;
}

export function ConversionFunnelChart({
    data,
    loading,
    title = "Conversion Funnel",
    description = "Lead progression through sales stages",
}: ConversionFunnelChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
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
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        No funnel data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sort data by percentage descending (funnel order)
    const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedData.map((stage, index) => {
                        const isFirst = index === 0;
                        const widthPercentage = stage.percentage;
                        const color = isFirst
                            ? "bg-primary"
                            : stage.stage.toLowerCase().includes("converted")
                                ? "bg-green-600"
                                : stage.stage.toLowerCase().includes("qualified")
                                    ? "bg-blue-600"
                                    : "bg-orange-600";

                        return (
                            <div key={stage.stage} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{stage.stage}</span>
                                    <span className="text-muted-foreground">
                                        {stage.count} ({stage.percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="relative h-12 bg-muted rounded-md overflow-hidden">
                                    <div
                                        className={`h-full ${color} transition-all duration-500 flex items-center justify-center text-white font-medium text-sm`}
                                        style={{ width: `${widthPercentage}%` }}
                                    >
                                        {widthPercentage > 20 && (
                                            <span>
                                                {stage.count} ({stage.percentage.toFixed(0)}%)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Conversion Rate Summary */}
                {sortedData.length >= 2 && (
                    <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Conversion Rate</span>
                            <span className="text-lg font-bold text-green-600">
                                {sortedData[sortedData.length - 1].percentage.toFixed(1)}%
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {sortedData[sortedData.length - 1].count} of {sortedData[0].count} leads converted
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
