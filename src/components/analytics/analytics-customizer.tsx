"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";

export type WidgetId =
    | "kpi_financials"
    | "kpi_operations"
    | "kpi_customers"
    | "chart_revenue"
    | "chart_breakdowns";

const DEFAULT_WIDGETS: Record<WidgetId, boolean> = {
    kpi_financials: true,
    kpi_operations: true,
    kpi_customers: true,
    chart_revenue: true,
    chart_breakdowns: true,
};

export function useAnalyticsWidgets() {
    const [visibleWidgets, setVisibleWidgets] = useState<Record<WidgetId, boolean>>(DEFAULT_WIDGETS);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const init = async () => {
            setMounted(true);
            const saved = localStorage.getItem("analytics-widgets-pref");
            if (saved) {
                try {
                    setVisibleWidgets(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse widget prefs", e);
                }
            }
        };
        void init();
    }, []);

    const toggleWidget = (id: WidgetId) => {
        const newState = { ...visibleWidgets, [id]: !visibleWidgets[id] };
        setVisibleWidgets(newState);
        localStorage.setItem("analytics-widgets-pref", JSON.stringify(newState));
    };

    return { visibleWidgets, toggleWidget, mounted };
}

interface AnalyticsCustomizerProps {
    visibleWidgets: Record<WidgetId, boolean>;
    toggleWidget: (id: WidgetId) => void;
}

export function AnalyticsCustomizer({ visibleWidgets, toggleWidget }: AnalyticsCustomizerProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden h-8 lg:flex">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Customize View
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle Widgets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    checked={visibleWidgets.kpi_financials}
                    onCheckedChange={() => toggleWidget("kpi_financials")}
                >
                    Financial KPIs
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={visibleWidgets.kpi_operations}
                    onCheckedChange={() => toggleWidget("kpi_operations")}
                >
                    Operational KPIs
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={visibleWidgets.kpi_customers}
                    onCheckedChange={() => toggleWidget("kpi_customers")}
                >
                    Customer & Agent KPIs
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                    checked={visibleWidgets.chart_revenue}
                    onCheckedChange={() => toggleWidget("chart_revenue")}
                >
                    Revenue Charts
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                    checked={visibleWidgets.chart_breakdowns}
                    onCheckedChange={() => toggleWidget("chart_breakdowns")}
                >
                    Breakdown Charts
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
