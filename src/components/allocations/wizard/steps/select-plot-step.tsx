"use client";

import { useState, useEffect, useCallback } from "react";
import { getEstatesAction, getEstatePlotsAction } from "@/lib/actions/estate-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { WizardData, SelectedPlot } from "../allocation-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StepProps {
    data: WizardData;
    updateData: (data: Partial<WizardData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function SelectPlotStep({ data, updateData, onNext, onBack }: StepProps) {
    const [estates, setEstates] = useState<any[]>([]);
    const [plots, setPlots] = useState<any[]>([]);
    const [loadingEstates, setLoadingEstates] = useState(true);
    const [loadingPlots, setLoadingPlots] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [multiSelectMode, setMultiSelectMode] = useState(false);

    // Reset plots when size changes
    const handleSizeChange = (val: string) => {
        updateData({
            plotSize: val,
            plotId: "",
            plotNumber: undefined,
            plotPrice: undefined,
            selectedPlots: []
        });
    };

    const fetchEstates = useCallback(async () => {
        setLoadingEstates(true);
        try {
            const res = await getEstatesAction({});
            if (res.data) {
                setEstates(res.data as any[]);
            } else {
                toast.error("Failed to fetch estates");
            }
        } catch (error) {
            toast.error("An error occurred while fetching estates");
        } finally {
            setLoadingEstates(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchEstates();
        };
        void init();
    }, [fetchEstates]);

    const fetchPlots = useCallback(async () => {
        if (!data.estateId) {
            setPlots([]);
            return;
        }

        setLoadingPlots(true);
        try {
            const statuses = data.plotSize === 'half_plot'
                ? ["available", "partially_allocated"]
                : ["available"];

            const result = await getEstatePlotsAction({
                estateId: data.estateId
                // The repository handles the filtering if we pass it,
                // but BaseRepository.findAll only does basic equality.
                // For 'in' filters, we might need a custom method or handle it here if it returns all.
            });

            if (result.data?.success) {
                // Filter manually for now if BaseRepository doesn't handle 'in'
                const pData = (result.data.plots as any[]).filter(p => statuses.includes(p.status));

                // Natural sort for plot numbers (e.g., handles 1, 2, 10 correctly)
                const sorted = pData.sort((a, b) => {
                    return a.plot_number.localeCompare(b.plot_number, undefined, { numeric: true, sensitivity: 'base' });
                });
                setPlots(sorted);
            } else {
                setPlots([]);
                toast.error("Failed to fetch plots");
            }
        } catch (error) {
            toast.error("An error occurred while fetching plots");
        } finally {
            setLoadingPlots(false);
        }
    }, [data.estateId, data.plotSize]);

    useEffect(() => {
        const init = async () => {
            await fetchPlots();
        };
        void init();
    }, [fetchPlots]);

    const handleEstateChange = (val: string) => {
        const estate = estates.find(e => e.id === val);
        updateData({
            estateId: val,
            estateName: estate?.name,
            plotId: "",
            plotNumber: undefined,
            plotPrice: undefined,
            selectedPlots: []
        });
    };

    // Single plot selection (legacy mode)
    const handleSinglePlotSelect = (plotId: string) => {
        if (plotId === 'unassigned') {
            updateData({
                plotId: 'unassigned',
                plotNumber: 'Unassigned',
                plotPrice: 0,
                selectedPlots: []
            });
        } else {
            const plot = plots.find(p => p.id === plotId);
            const estate = estates.find(e => e.id === data.estateId);
            const basePrice = plot?.price ?? estate?.price ?? 0;
            const finalPrice = data.plotSize === 'half_plot' ? (basePrice / 2) : basePrice;

            updateData({
                plotId: plotId,
                plotNumber: plot?.plot_number,
                plotPrice: finalPrice,
                selectedPlots: [{
                    id: plotId,
                    plot_number: plot?.plot_number,
                    price: finalPrice,
                    size: data.plotSize as 'full_plot' | 'half_plot'
                }]
            });
        }
    };

    // Multi-plot selection toggle
    const handleMultiPlotToggle = (plotId: string) => {
        const plot = plots.find(p => p.id === plotId);
        if (!plot) return;

        const estate = estates.find(e => e.id === data.estateId);
        const basePrice = plot?.price ?? estate?.price ?? 0;
        const finalPrice = data.plotSize === 'half_plot' ? (basePrice / 2) : basePrice;

        const isSelected = data.selectedPlots.some(p => p.id === plotId);

        let newSelectedPlots: SelectedPlot[];
        if (isSelected) {
            newSelectedPlots = data.selectedPlots.filter(p => p.id !== plotId);
        } else {
            newSelectedPlots = [...data.selectedPlots, {
                id: plotId,
                plot_number: plot.plot_number,
                price: finalPrice,
                size: data.plotSize as 'full_plot' | 'half_plot'
            }];
        }

        // Update both legacy fields and new multi-plot array
        updateData({
            selectedPlots: newSelectedPlots,
            plotId: newSelectedPlots.length === 1 ? newSelectedPlots[0].id : '',
            plotNumber: newSelectedPlots.length === 1 ? newSelectedPlots[0].plot_number : undefined,
            plotPrice: newSelectedPlots.reduce((sum, p) => sum + p.price, 0)
        });
    };

    const isPlotSelected = (plotId: string) => {
        if (multiSelectMode) {
            return data.selectedPlots.some(p => p.id === plotId);
        }
        return data.plotId === plotId;
    };

    const handlePlotClick = (plotId: string) => {
        if (multiSelectMode) {
            handleMultiPlotToggle(plotId);
        } else {
            handleSinglePlotSelect(plotId);
        }
    };

    const totalSelectedPrice = data.selectedPlots.reduce((sum, p) => sum + p.price, 0);
    const canContinue = data.estateId && (data.selectedPlots.length > 0 || data.plotId === 'unassigned');

    if (loadingEstates) return <Skeleton className="h-[200px] w-full" />;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Estate</Label>
                        <Select
                            value={data.estateId}
                            onValueChange={handleEstateChange}
                        >
                            <SelectTrigger data-testid="estate-select">
                                <SelectValue placeholder="Choose Estate..." />
                            </SelectTrigger>
                            <SelectContent>
                                {estates.map((estate) => (
                                    <SelectItem key={estate.id} value={estate.id}>
                                        {estate.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Allocation Size Toggle */}
                    <div className="space-y-2">
                        <Label>Allocation Type</Label>
                        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
                            <Button
                                variant={data.plotSize !== 'half_plot' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => handleSizeChange('full_plot')}
                                className={data.plotSize !== 'half_plot' ? 'shadow-sm bg-background' : 'text-muted-foreground'}
                            >
                                Full Plot (100ft x 100ft)
                            </Button>
                            <Button
                                variant={data.plotSize === 'half_plot' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => handleSizeChange('half_plot')}
                                className={data.plotSize === 'half_plot' ? 'shadow-sm bg-background' : 'text-muted-foreground'}
                            >
                                Half Plot (50ft x 100ft)
                            </Button>
                        </div>
                    </div>

                    {/* Multi-Select Toggle */}
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <Checkbox
                            id="multi-select"
                            checked={multiSelectMode}
                            onCheckedChange={(checked) => {
                                setMultiSelectMode(!!checked);
                                if (!checked) {
                                    // Reset to single mode
                                    updateData({ selectedPlots: [], plotId: '', plotNumber: undefined, plotPrice: undefined });
                                }
                            }}
                        />
                        <div className="flex-1">
                            <Label htmlFor="multi-select" className="cursor-pointer font-medium">
                                Bulk Purchase Mode
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Select multiple plots for this customer
                            </p>
                        </div>
                    </div>

                    {/* Selected Plots Summary */}
                    {data.selectedPlots.length > 0 && (
                        <div className="p-4 rounded-lg border bg-green-50/50 border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-green-800">
                                    {data.selectedPlots.length} Plot{data.selectedPlots.length > 1 ? 's' : ''} Selected
                                </span>
                                <span className="text-lg font-bold text-green-700">
                                    ₦{totalSelectedPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {data.selectedPlots.map(plot => (
                                    <Badge
                                        key={plot.id}
                                        variant="secondary"
                                        className="bg-green-100 text-green-800 gap-1"
                                    >
                                        #{plot.plot_number}
                                        <button
                                            onClick={() => handleMultiPlotToggle(plot.id)}
                                            className="hover:bg-green-200 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>
                            Select Plot{multiSelectMode ? 's' : ''} {data.plotSize === 'half_plot' ? '(Half)' : '(Full)'}
                        </Label>
                        <div className="flex items-center border rounded-md p-1 bg-muted/20">
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Grid View */}
                    <div className="border rounded-md p-4 bg-muted/10 h-[400px] overflow-y-auto">
                        {!data.estateId ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Select an estate to view plots
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {/* Unassigned Option (only in single mode) */}
                                {!multiSelectMode && (
                                    <Card
                                        className={`p-3 cursor-pointer transition-all hover:border-primary/50 flex flex-col items-center justify-center text-center gap-1 ${data.plotId === 'unassigned' ? 'border-orange-500 bg-orange-50/20' : ''}`}
                                        onClick={() => handlePlotClick('unassigned')}
                                    >
                                        <span className="font-medium text-sm">Unassigned</span>
                                        <span className="text-xs text-muted-foreground">Assign later</span>
                                    </Card>
                                )}

                                {plots.map(p => {
                                    const estate = estates.find(e => e.id === data.estateId);
                                    const basePrice = p.price ?? estate?.price ?? 0;
                                    const displayPrice = data.plotSize === 'half_plot' ? (basePrice / 2) : basePrice;
                                    const selected = isPlotSelected(p.id);

                                    return (
                                        <Card
                                            key={p.id}
                                            data-testid="plot-card"
                                            data-status={p.status}
                                            className={`
                                                p-3 cursor-pointer transition-all hover:border-primary/50 flex flex-col items-center justify-center text-center gap-1 relative
                                                ${selected ? 'border-primary ring-2 ring-primary bg-primary/5' : ''}
                                                ${p.status === 'partially_allocated' && !selected ? 'border-yellow-200 bg-yellow-50/20' : ''}
                                            `}
                                            onClick={() => handlePlotClick(p.id)}
                                        >
                                            {/* Selection indicator for multi-mode */}
                                            {multiSelectMode && selected && (
                                                <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center gap-1">
                                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                    #{p.plot_number}

                                                </Badge>
                                                {p.status === 'partially_allocated' && (
                                                    <span className="text-[9px] text-amber-600 font-medium bg-amber-50 px-1 rounded">
                                                        1 Half Taken
                                                    </span>
                                                )}
                                                {data.plotSize === 'half_plot' && p.status === 'available' && (
                                                    <span className="text-[9px] text-green-600 font-medium bg-green-50 px-1 rounded">
                                                        Fresh
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs font-mono">₦{displayPrice?.toLocaleString() ?? "N/A"}</span>
                                            {p.dimensions && <span className="text-[10px] text-muted-foreground">{p.dimensions}</span>}
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {loadingPlots && <p className="text-xs text-muted-foreground animate-pulse">Loading plots...</p>}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={!canContinue}>
                    {data.selectedPlots.length > 1
                        ? `Continue with ${data.selectedPlots.length} Plots`
                        : 'Continue to Terms'}
                </Button>
            </div>
        </div>
    );
}
