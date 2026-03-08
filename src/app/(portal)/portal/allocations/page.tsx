"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface AllocationPlot {
    plot_id: string;
    plot_size: string;
    unit_price: number;
    plots: {
        plot_number: string;
        dimensions: string;
    };
}

interface Allocation {
    id: string;
    status: string;
    total_price: number;
    plot_count: number;
    plot_size: string;
    created_at: string;
    estate: {
        name: string;
        location: string;
        image_url?: string;
    };
    plot?: {
        plot_number: string;
        dimensions: string;
    };
    allocation_plots?: AllocationPlot[];
}

export default function MyAllocationsPage() {
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchAllocations() {
            setLoading(false);
        }
        fetchAllocations();
    }, []);

    const getPlotDisplay = (alloc: Allocation) => {
        // Check for multi-plot allocations first
        if (alloc.allocation_plots && alloc.allocation_plots.length > 1) {
            return {
                isMulti: true,
                count: alloc.allocation_plots.length,
                plots: alloc.allocation_plots.map(ap => ap.plots?.plot_number || 'Unknown')
            };
        }
        // Single plot from allocation_plots
        if (alloc.allocation_plots && alloc.allocation_plots.length === 1) {
            return {
                isMulti: false,
                count: 1,
                number: alloc.allocation_plots[0].plots?.plot_number,
                dimensions: alloc.allocation_plots[0].plots?.dimensions
            };
        }
        // Legacy single plot
        return {
            isMulti: false,
            count: 1,
            number: alloc.plot?.plot_number,
            dimensions: alloc.plot?.dimensions
        };
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Allocations</h2>
                <p className="text-muted-foreground">Detailed view of your assigned plots.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {allocations.map((alloc) => {
                    const plotInfo = getPlotDisplay(alloc);

                    return (
                        <Card key={alloc.id} className="overflow-hidden hover:shadow-lg transition-all group">
                            <div className="h-32 bg-muted relative">
                                {alloc.estate?.image_url ? (
                                    <img src={alloc.estate.image_url} alt={alloc.estate.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                        <MapPin className="h-8 w-8" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {plotInfo.isMulti && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                            <Layers className="h-3 w-3 mr-1" />
                                            {plotInfo.count} Plots
                                        </Badge>
                                    )}
                                    <Badge variant={alloc.status === 'approved' ? 'success' : 'secondary'}>
                                        {alloc.status}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <CardTitle>{alloc.estate?.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{alloc.estate?.location}</p>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        {plotInfo.isMulti ? 'Plots:' : 'Plot Number:'}
                                    </span>
                                    <span className="font-semibold">
                                        {plotInfo.isMulti
                                            ? plotInfo.plots?.map(p => `#${p}`).join(', ')
                                            : `#${plotInfo.number || 'TBD'}`
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Plot Size:</span>
                                    <span className="capitalize">
                                        {alloc.plot_size?.replace('_', ' ') || 'Full Plot'}
                                        {plotInfo.isMulti && ` × ${plotInfo.count}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Price:</span>
                                    <span className="font-semibold text-brand-purple">{formatCurrency(alloc.total_price || 0)}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 p-4">
                                <Button className="w-full group-hover:bg-brand-purple group-hover:text-white transition-colors" variant="outline" asChild>
                                    <Link href={`/portal/properties/${alloc.id}`}>
                                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
                {allocations.length === 0 && (
                    <div className="col-span-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                        <p>No allocations found.</p>
                        <Button variant="link">Browse Available Estates</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
