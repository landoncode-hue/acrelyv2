import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    description?: string;
    className?: string;
}

export function KpiCard({ title, value, icon: Icon, trend, description, className }: KpiCardProps) {
    return (
        <Card className={cn("u-card overflow-hidden", className)}>
            <div className="p-6 space-y-5">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                        {title}
                    </p>
                    <div className="rounded-lg p-2.5 border border-border bg-background shadow-sm shrink-0 text-primary">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="space-y-1 min-w-0">
                    <div className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground truncate" title={String(value)}>
                        {value}
                    </div>
                    {(trend || description) && (
                        <div className="flex items-center gap-2 text-sm pt-1">
                            {trend && (
                                <div className={cn(
                                    "flex items-center font-medium px-2 py-0.5 rounded-full text-xs border",
                                    trend.positive
                                        ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800"
                                        : "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-800"
                                )}>
                                    {trend.positive ? "↑" : "↓"} {trend.value}%
                                </div>
                            )}
                            <span className="text-muted-foreground text-sm">
                                {trend ? "vs last month" : description}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
