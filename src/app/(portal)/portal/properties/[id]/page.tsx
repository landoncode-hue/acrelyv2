"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AllocationPlot {
    plot_id: string;
    plot_size: string;
    unit_price: number;
    plots: {
        plot_number: string;
        dimensions: string;
    };
}

interface AllocationData {
    id: string;
    status: string;
    total_price: number;
    net_price: number;
    plot_size: string;
    plot_count: number;
    created_at: string;
    plot?: {
        plot_number: string;
        dimensions: string;
    };
    estate?: {
        name: string;
        location: string;
        image_urls?: string[];
    };
    allocation_plots?: AllocationPlot[];
}

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [data, setData] = useState<AllocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<{ total_paid: number; outstanding: number; progress: number }>({
        total_paid: 0, outstanding: 0, progress: 0
    });

    useEffect(() => {
        async function load() {
            if (!id) return;
            setLoading(false);
        }
        load();
    }, [id]);

    if (loading) return <Skeleton className="h-64 w-full" />;
    if (!data) return <div>Property not found</div>;

    // Determine if multi-plot
    const hasMultiplePlots = data.allocation_plots && data.allocation_plots.length > 1;
    const plotCount = data.allocation_plots?.length || (data.plot ? 1 : 0);

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Properties
            </Button>

            {/* Hero Image */}
            <div className="relative h-48 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                {data.estate?.image_urls?.[0] ? (
                    <img
                        src={data.estate.image_urls[0]}
                        alt={data.estate.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <MapPin className="h-12 w-12 text-slate-300" />
                )}
                {hasMultiplePlots && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <Layers className="h-3 w-3 mr-1" />
                            {plotCount} Plots - Bulk Purchase
                        </Badge>
                    </div>
                )}
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">{data.estate?.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" /> {data.estate?.location}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{hasMultiplePlots ? 'Plots Details' : 'Plot Details'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {hasMultiplePlots ? (
                            // Multi-plot display
                            <>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Number of Plots</span>
                                    <span className="font-bold">{plotCount} plots</span>
                                </div>
                                <div className="border-b pb-3">
                                    <span className="text-sm text-muted-foreground">Plot Numbers:</span>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {data.allocation_plots?.map((ap, idx) => (
                                            <Badge key={idx} variant="outline" className="text-sm">
                                                #{ap.plots?.plot_number || 'Unknown'}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 border-b pb-3">
                                    <span className="text-sm text-muted-foreground">Price Breakdown:</span>
                                    {data.allocation_plots?.map((ap, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>Plot #{ap.plots?.plot_number} ({ap.plot_size.replace('_', ' ')})</span>
                                            <span>₦{ap.unit_price?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-semibold pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-brand-purple">₦{(data.total_price || data.net_price)?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            // Single plot display
                            <>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Plot Number</span>
                                    <span className="font-bold">
                                        #{data.allocation_plots?.[0]?.plots?.plot_number || data.plot?.plot_number || 'TBD'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Size</span>
                                    <span className="capitalize">{data.plot_size?.replace('_', ' ') || 'Full Plot'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Price</span>
                                    <span className="font-bold text-brand-purple">₦{(data.total_price || data.net_price)?.toLocaleString()}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between border-b pb-2">
                            <span>Allocation Date</span>
                            <span>{new Date(data.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span>Status</span>
                            <Badge variant={data.status === 'approved' ? 'success' : 'secondary'}>
                                {data.status === 'approved' ? 'Active' : data.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Payment Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Value</span>
                                <span className="font-bold">₦{(data.total_price || data.net_price)?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount Paid</span>
                                <span className="font-bold text-green-600">₦{payments.total_paid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Outstanding</span>
                                <span className="font-bold text-orange-600">₦{payments.outstanding.toLocaleString()}</span>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span className="font-medium text-brand-purple">{payments.progress.toFixed(1)}%</span>
                                </div>
                                <Progress value={payments.progress} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Legal documents for this property.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 border border-dashed rounded text-center text-muted-foreground text-sm">
                                No documents generated yet.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
