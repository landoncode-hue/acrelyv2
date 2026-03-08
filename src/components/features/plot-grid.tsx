"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { isHalfPlot, getBasePlotNumber, getPlotTypeLabel } from "@/lib/utils/plot";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Chip } from "@/components/ui/chip";
import Link from "next/link";
import { MarkPlotUnavailable } from "@/components/plots/mark-plot-unavailable";

interface Plot {
    id: string;
    plot_number: string;
    status: "available" | "reserved" | "sold" | "allocated" | "partially_allocated" | "unavailable";
    dimensions: string;
    price?: number;
    size?: string;
}

interface Allocation {
    id: string;
    plot_number?: string;
    plot_id?: string;
    plot_half?: string;  // 'A' or 'B' for half-plots
    customer_name?: string;
    customer_phone?: string;
    status: string;
    created_at: string;
    additional_plot_ids?: string[]; // Array of UUIDs for multi-plot allocations
}

interface PlotGridProps {
    plots: Plot[];
    estateId: string;
    allocations?: Allocation[];
    targetPlotSize?: 'full_plot' | 'half_plot';
    onSelect?: (plot: Plot, suffix?: string) => void;
}

export function PlotGrid({ plots, estateId, allocations = [], onSelect, targetPlotSize }: PlotGridProps) {
    const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
    const { profile } = useProfile();
    const router = useRouter();
    const [manualSuffix, setManualSuffix] = useState<string>("A"); // Default to A

    const handleDraftAllocation = async () => {
        if (!selectedPlot) return;
        try {
            router.push(`/dashboard/allocations/new?plot_id=${selectedPlot.id}&estate_id=${estateId}`);
        } catch {
            toast.error("Failed to start allocation");
        }
    };

    // Intelligent plot sorting function
    const sortPlots = (a: Plot, b: Plot) => {
        const aNum = a.plot_number;
        const bNum = b.plot_number;

        // P-UNASSIGNED plots go last
        const aIsUnassigned = aNum.startsWith('P-UNASSIGNED');
        const bIsUnassigned = bNum.startsWith('P-UNASSIGNED');

        if (aIsUnassigned && !bIsUnassigned) return 1;
        if (!aIsUnassigned && bIsUnassigned) return -1;
        if (aIsUnassigned && bIsUnassigned) {
            // Sort P-UNASSIGNED plots by their number
            const aIndex = parseInt(aNum.split('-')[2] || '0');
            const bIndex = parseInt(bNum.split('-')[2] || '0');
            return aIndex - bIndex;
        }

        // Handle combined plots (e.g., "1,7" or "10&11") - sort by first number
        const extractFirstNumber = (str: string): number => {
            const match = str.match(/^(\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        // Check if either plot is a combined plot
        const aIsCombined = /[,&]/.test(aNum);
        const bIsCombined = /[,&]/.test(bNum);

        if (aIsCombined || bIsCombined) {
            const aFirst = extractFirstNumber(aNum);
            const bFirst = extractFirstNumber(bNum);
            if (aFirst !== bFirst) return aFirst - bFirst;
            // If same first number, combined plots come after single plots
            if (aIsCombined && !bIsCombined) return 1;
            if (!aIsCombined && bIsCombined) return -1;
            // Both combined, compare as strings
            return aNum.localeCompare(bNum, undefined, { numeric: true });
        }

        // Extract numeric part and suffix
        const aMatch = aNum.match(/^(\d+)([A-Z]*)$/);
        const bMatch = bNum.match(/^(\d+)([A-Z]*)$/);

        if (aMatch && bMatch) {
            const aBase = parseInt(aMatch[1]);
            const bBase = parseInt(bMatch[1]);
            const aSuffix = aMatch[2] || '';
            const bSuffix = bMatch[2] || '';

            // Sort by number first
            if (aBase !== bBase) return aBase - bBase;
            // Then by suffix (A before B, etc.)
            return aSuffix.localeCompare(bSuffix);
        }

        // Fallback to string comparison
        return aNum.localeCompare(bNum, undefined, { numeric: true });
    };

    const sortedPlots = [...plots].sort(sortPlots);

    // Helper function to display plot number nicely
    const displayPlotNumber = (plotNumber: string, showFull = false) => {
        if (plotNumber.startsWith('P-UNASSIGNED-')) {
            const index = plotNumber.split('-')[2];
            return `Unassigned #${index}`;
        }
        return showFull ? plotNumber : getBasePlotNumber(plotNumber);
    };

    // Helper to check if a plot is actually a half-plot based on allocation data
    const isActuallyHalfPlot = (plotId: string) => {
        const plotAllocs = allocations.filter(a => a.plot_id === plotId);
        return plotAllocs.some(a => a.plot_half === 'A' || a.plot_half === 'B');
    };

    // Get ALL allocations for this plot (important for half-plots with multiple owners OR multi-plot purchases)
    const plotAllocations = selectedPlot
        ? allocations.filter(a =>
            a.plot_number === selectedPlot.plot_number ||
            a.plot_id === selectedPlot.id ||
            (a.additional_plot_ids && a.additional_plot_ids.includes(selectedPlot.id))
        )
        : [];

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {sortedPlots.map((plot) => (

                    <button
                        key={plot.id}
                        onClick={() => setSelectedPlot(plot)}
                        disabled={plot.status === "sold" && !['sysadmin', 'ceo', 'md', 'frontdesk'].includes(profile?.role || "")}
                        title={`Plot ${displayPlotNumber(plot.plot_number)} - ${plot.status}${plot.price ? ` - ₦${plot.price.toLocaleString()}` : ''}${plot.size ? ` - ${plot.size}` : ''}`}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-2 rounded-md border-2 bg-card shadow-sm transition-all hover:shadow-md aspect-square group overflow-hidden",
                            // Status Colors (Borders & Background tints)
                            plot.status === "available" && "border-green-500 bg-green-50/50 dark:bg-green-500/10 hover:bg-green-100/50 dark:hover:bg-green-500/20",
                            plot.status === "allocated" && "border-red-600 bg-red-100/50 dark:bg-red-600/10 hover:bg-red-200/50 dark:hover:bg-red-600/20", // Darker Red
                            plot.status === "sold" && "border-red-700 bg-red-200/40 dark:bg-red-700/20 hover:bg-red-200/60 dark:hover:bg-red-700/30 opacity-90", // Even Darker Red for Sold
                            plot.status === "reserved" && "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-500/10 hover:bg-yellow-100/50 dark:hover:bg-yellow-500/20",
                            plot.status === "partially_allocated" && "border-amber-500 bg-amber-100/40 dark:bg-amber-500/10 hover:bg-amber-100/60 dark:hover:bg-amber-500/20", // Distinct Amber
                            plot.status === "unavailable" && "border-gray-400 bg-gray-100/50 dark:bg-gray-400/10 hover:bg-gray-200/50 dark:hover:bg-gray-400/20 opacity-75"
                        )}
                    >
                        {/* Half Plot Badge (Top Left) - Only show if actually a half-plot allocation */}
                        {isActuallyHalfPlot(plot.id) && (
                            <div className="absolute top-1 left-1">
                                <span className="text-[8px] font-bold uppercase bg-amber-600 text-white px-1 py-0.5 rounded">
                                    ½
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-1">
                            <span className={cn(
                                "text-lg font-bold",
                                plot.status === "available" && "text-green-700",
                                plot.status === "allocated" && "text-red-700",
                                plot.status === "reserved" && "text-yellow-700",
                                plot.status === "sold" && "text-red-800", // Darker text for sold
                                plot.status === "partially_allocated" && "text-amber-700", // Amber text
                                plot.status === "unavailable" && "text-gray-600"
                            )}>
                                {displayPlotNumber(plot.plot_number)}
                            </span>
                            <span className="text-[10px] uppercase font-semibold opacity-60">
                                100ftx100ft
                            </span>
                        </div>

                        {/* Status Badge (Overlay) */}
                        <div className="absolute bottom-1 right-1">
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                "bg-current",
                                plot.status === "available" && "text-green-500",
                                plot.status === "allocated" && "text-red-500",
                                plot.status === "reserved" && "text-yellow-500",
                                plot.status === "sold" && "text-red-700",
                                plot.status === "partially_allocated" && "text-amber-500",
                                plot.status === "unavailable" && "text-gray-500"
                            )} />
                        </div>
                    </button>
                ))}
            </div>

            <Sheet open={!!selectedPlot} onOpenChange={(open) => !open && setSelectedPlot(null)}>
                <SheetContent className="w-[400px] sm:w-[540px]">
                    {selectedPlot && (
                        <div className="flex flex-col h-full">
                            <SheetHeader className="pb-6 border-b">
                                <SheetTitle className="text-2xl flex items-center gap-2">
                                    Plot {displayPlotNumber(selectedPlot.plot_number, true)}
                                    {isActuallyHalfPlot(selectedPlot.id) && (
                                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 text-xs">
                                            Split Plot
                                        </Badge>
                                    )}
                                </SheetTitle>
                                <SheetDescription className="flex items-center gap-2">
                                    <Chip className="capitalize">
                                        {selectedPlot.status.replace(/_/g, ' ')}
                                    </Chip>
                                    <span>{selectedPlot.dimensions}</span>
                                </SheetDescription>
                            </SheetHeader>

                            <div className="flex-1 py-6 space-y-6 overflow-y-auto">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Pricing</h4>
                                    <div className="text-3xl font-bold tracking-tight text-brand-purple">
                                        {selectedPlot.price ? `₦${selectedPlot.price.toLocaleString()}` : 'Standard'}
                                    </div>
                                    {selectedPlot.size && (
                                        <p className="text-sm text-muted-foreground">{selectedPlot.size}</p>
                                    )}
                                </div>

                                {/* Allocation Info - Show ALL allocations for this plot */}
                                {plotAllocations.length > 0 ? (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-muted-foreground">
                                            Allocations ({plotAllocations.length})
                                            {plotAllocations.length > 1 && (
                                                <span className="ml-2 text-xs font-normal text-amber-600">Split Plot</span>
                                            )}
                                        </h4>
                                        {plotAllocations.map((allocation, index) => (
                                            <div key={allocation.id} className="rounded-lg border bg-muted/20 p-4 space-y-3">
                                                <div className="flex items-center justify-between border-b pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                                                        {allocation.plot_half && (
                                                            <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30">
                                                                Half {allocation.plot_half}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Chip className="capitalize">{allocation.status}</Chip>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Customer</p>
                                                        <p className="font-medium">{allocation.customer_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Phone</p>
                                                        <p className="font-medium">{allocation.customer_phone}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Date</p>
                                                        <p className="font-medium">{new Date(allocation.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <p className="font-medium capitalize">
                                                        {allocation.plot_half
                                                            ? `Half Plot (${allocation.plot_half})`
                                                            : 'Full Plot'}
                                                    </p>
                                                </div>
                                                <Button size="sm" variant="outline" className="w-full" asChild>
                                                    <Link href={`/dashboard/allocations/${allocation.id}`}>View Details</Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border bg-muted/40 p-4">
                                        <h4 className="text-sm font-semibold mb-2">Allocation Details</h4>
                                        <p className="text-sm text-muted-foreground">No active allocation found for this plot.</p>
                                    </div>
                                )}
                            </div>

                            <SheetFooter className="mt-auto border-t pt-6 flex-col gap-2">
                                {/* Admin Action: Mark Unavailable */}
                                {selectedPlot.status === 'available' && ['sysadmin', 'ceo', 'md'].includes(profile?.role || "") && (
                                    <MarkPlotUnavailable
                                        plotId={selectedPlot.id}
                                        plotNumber={selectedPlot.plot_number}
                                        onSuccess={() => {
                                            setSelectedPlot(null);
                                            // Trigger parent refresh if callback provided
                                        }}
                                    />
                                )}

                                {onSelect ? (
                                    <div className="space-y-3 w-full">
                                        {targetPlotSize === 'half_plot' && (
                                            <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-100 dark:border-amber-500/20">
                                                <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1.5 block uppercase">Half Plot Assignment</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => setManualSuffix("A")}
                                                        className={cn(
                                                            "px-3 py-2 text-sm font-medium rounded-md border transition-all",
                                                            manualSuffix === "A"
                                                                ? "bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-700 shadow-sm"
                                                                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700"
                                                        )}
                                                    >
                                                        Assign &quot;A&quot;
                                                    </button>
                                                    <button
                                                        onClick={() => setManualSuffix("B")}
                                                        className={cn(
                                                            "px-3 py-2 text-sm font-medium rounded-md border transition-all",
                                                            manualSuffix === "B"
                                                                ? "bg-amber-600 dark:bg-amber-700 text-white border-amber-600 dark:border-amber-700 shadow-sm"
                                                                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700"
                                                        )}
                                                    >
                                                        Assign &quot;B&quot;
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-2">
                                                    Make sure you select the correct half based on existing allocations.
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            className="w-full h-11 text-base shadow-sm"
                                            onClick={() => {
                                                onSelect(selectedPlot, targetPlotSize === 'half_plot' ? manualSuffix : undefined);
                                                setSelectedPlot(null);
                                            }}
                                            disabled={selectedPlot.status !== 'available' && selectedPlot.status !== 'partially_allocated'}
                                        >
                                            {selectedPlot.status === 'available' || selectedPlot.status === 'partially_allocated'
                                                ? `Select Plot ${selectedPlot.plot_number}${targetPlotSize === 'half_plot' ? manualSuffix : ''}`
                                                : 'Plot Not Available'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 w-full">
                                        {(selectedPlot.status === 'available' || selectedPlot.status === 'partially_allocated') &&
                                            ['sysadmin', 'ceo', 'md', 'frontdesk'].includes(profile?.role || "") && (
                                                <Button className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all" onClick={handleDraftAllocation}>
                                                    {selectedPlot.status === 'partially_allocated' ? 'Allocate Remaining Half' : 'Draft Allocation'}
                                                </Button>
                                            )}
                                        {plotAllocations.length === 1 && (
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href={`/dashboard/allocations/${plotAllocations[0].id}`}>Manage Allocation</Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </SheetFooter>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}
