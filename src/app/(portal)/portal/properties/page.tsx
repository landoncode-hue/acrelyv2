"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Home, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
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

interface PropertyWithMetrics {
    id: string;
    status: string;
    net_price: number;
    total_price: number;
    plot_count: number;
    plot_size: string;
    created_at: string;
    estates: {
        name: string;
        location: string;
        image_urls: string[];
    };
    plots: {
        plot_number: string;
        dimensions: string;
    };
    allocation_plots?: AllocationPlot[];
    total_paid: number;
    outstanding_balance: number;
    payment_progress: number;
}

export default function MyPropertiesPage() {
    const [properties, setProperties] = useState<PropertyWithMetrics[]>([]);
    const [loading, setLoading] = useState(true);

    const { profile } = useProfile();

    useEffect(() => {
        async function fetchProperties() {
            if (!profile) return;



            setLoading(false);
        }

        fetchProperties();
    }, [profile]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-80" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
                    <p className="text-muted-foreground">View and manage your real estate portfolio</p>
                </div>
                {properties.length > 0 && (
                    <Badge variant="secondary" className="text-sm">
                        {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
                    </Badge>
                )}
            </div>

            {properties.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => {
                        // Determine plot display info
                        const hasMultiplePlots = property.allocation_plots && property.allocation_plots.length > 1;
                        const plotCount = property.allocation_plots?.length || (property.plots ? 1 : 0);
                        const plotNumbers = hasMultiplePlots
                            ? property.allocation_plots!.map(ap => ap.plots?.plot_number || 'N/A')
                            : property.plots?.plot_number ? [property.plots.plot_number] : [];

                        return (
                            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                {/* Property Image */}
                                <div className="h-48 bg-muted relative">
                                    {property.estates?.image_urls?.[0] ? (
                                        <img
                                            src={property.estates.image_urls[0]}
                                            alt={property.estates.name}
                                            className="w-full h-full object-cover transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-brand-pink/20">
                                            <Home className="h-12 w-12 text-brand-purple/30" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-1">
                                        {hasMultiplePlots && (
                                            <Badge variant="secondary" className="bg-green-100/90 text-green-800 border-green-200 backdrop-blur-sm">
                                                <Layers className="h-3 w-3 mr-1" />
                                                {plotCount} Plots
                                            </Badge>
                                        )}
                                        <Badge
                                            variant={property.status === 'approved' ? 'success' : 'secondary'}
                                            className="bg-white/90 backdrop-blur-sm"
                                        >
                                            {property.status === 'approved' ? 'Active' : property.status}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{property.estates?.name || 'Property'}</CardTitle>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {property.estates?.location || 'Location not specified'}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Property Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {hasMultiplePlots ? 'Plots' : 'Plot Number'}
                                            </span>
                                            <span className="font-medium">
                                                {hasMultiplePlots
                                                    ? plotNumbers.map(p => `#${p}`).join(', ')
                                                    : `#${plotNumbers[0] || 'TBD'}`
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Size</span>
                                            <span className="font-medium capitalize">
                                                {property.plot_size?.replace('_', ' ') || property.plots?.dimensions || 'N/A'}
                                                {hasMultiplePlots && ` × ${plotCount}`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Value</span>
                                            <span className="font-medium">₦{(property.total_price || property.net_price)?.toLocaleString() || '0'}</span>
                                        </div>
                                    </div>

                                    {/* Payment Progress */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Payment Progress</span>
                                            <span className="font-medium text-brand-purple">
                                                {property.payment_progress.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress value={property.payment_progress} className="h-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Paid: ₦{property.total_paid.toLocaleString()}</span>
                                            <span>Balance: ₦{property.outstanding_balance.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/portal/properties/${property.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <Home className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mb-6">
                            You don't have any properties in your portfolio. Contact our sales team to find your perfect property.
                        </p>
                        <Button asChild>
                            <Link href="/portal/help">Contact Sales Team</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
