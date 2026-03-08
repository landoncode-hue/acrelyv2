"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsKPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    tooltip?: string;
    loading?: boolean;
    className?: string;
}

export function AnalyticsKPICard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    tooltip,
    loading = false,
    className,
}: AnalyticsKPICardProps) {
    if (loading) {
        return (
            <Card className={className}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-3 w-full" />
                </CardContent>
            </Card>
        );
    }

    const TrendIcon = trend
        ? trend.value > 0
            ? TrendingUp
            : trend.value < 0
                ? TrendingDown
                : Minus
        : null;

    const trendColor = trend
        ? trend.positive !== undefined
            ? trend.positive
                ? "text-green-600"
                : "text-red-600"
            : trend.value > 0
                ? "text-green-600"
                : trend.value < 0
                    ? "text-red-600"
                    : "text-muted-foreground"
        : "";

    const cardContent = (
        <Card className={cn("transition-all hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && TrendIcon && (
                    <div className={cn("flex items-center gap-1 text-xs mt-2", trendColor)}>
                        <TrendIcon className="h-3 w-3" />
                        <span className="font-medium">
                            {Math.abs(trend.value).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">{trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return cardContent;
}
