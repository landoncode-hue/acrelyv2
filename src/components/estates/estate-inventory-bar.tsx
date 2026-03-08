"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EstateInventoryBarProps {
    totalPlots: number;
    availablePlots: number;
    reservedPlots: number;
    soldPlots: number;
    partiallyAllocatedPlots?: number;
    className?: string;
    showLabels?: boolean;
}

export function EstateInventoryBar({
    totalPlots,
    availablePlots,
    reservedPlots,
    soldPlots,
    partiallyAllocatedPlots = 0,
    className,
    showLabels = true
}: EstateInventoryBarProps) {
    const occupiedPlots = totalPlots - availablePlots;

    // Calculate percentages
    const availablePercent = totalPlots > 0 ? (availablePlots / totalPlots) * 100 : 0;
    const reservedPercent = totalPlots > 0 ? (reservedPlots / totalPlots) * 100 : 0;
    const soldPercent = totalPlots > 0 ? (soldPlots / totalPlots) * 100 : 0;
    const partialPercent = totalPlots > 0 ? (partiallyAllocatedPlots / totalPlots) * 100 : 0;

    return (
        <div className={cn("space-y-2", className)}>
            {showLabels && (
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Occupancy</span>
                    <span>{occupiedPlots} / {totalPlots} Plots</span>
                </div>
            )}

            <TooltipProvider>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden flex">
                    {/* Sold - Green */}
                    {soldPercent > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="bg-green-500 hover:bg-green-600 transition-colors cursor-help"
                                    style={{ width: `${soldPercent}%` }}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{soldPlots} Sold</p>
                                <p className="text-xs text-muted-foreground">{soldPercent.toFixed(1)}%</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Reserved - Yellow */}
                    {reservedPercent > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-help"
                                    style={{ width: `${reservedPercent}%` }}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{reservedPlots} Reserved</p>
                                <p className="text-xs text-muted-foreground">{reservedPercent.toFixed(1)}%</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Partially Allocated - Orange */}
                    {partialPercent > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="bg-orange-500 hover:bg-orange-600 transition-colors cursor-help"
                                    style={{ width: `${partialPercent}%` }}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{partiallyAllocatedPlots} Partially Allocated</p>
                                <p className="text-xs text-muted-foreground">{partialPercent.toFixed(1)}%</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Available - Remains as background (secondary) */}
                </div>
            </TooltipProvider>

            {showLabels && (
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Sold ({soldPlots})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-muted-foreground">Reserved ({reservedPlots})</span>
                    </div>
                    {partiallyAllocatedPlots > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                            <span className="text-muted-foreground">Partial ({partiallyAllocatedPlots})</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-secondary" />
                        <span className="text-muted-foreground">Available ({availablePlots})</span>
                    </div>
                </div>
            )}
        </div>
    );
}
