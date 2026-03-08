"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { EstateInventoryBar } from "@/components/estates/estate-inventory-bar";
import { EstateStatusBadge } from "@/components/estates/estate-status-badge";

interface Estate {
    id: string;
    name: string;
    code?: string;
    location: string;
    price: number;
    total_plots: number;
    available_plots: number;
    image_urls: string[];
    status?: "active" | "inactive" | "archived";
    occupied_plots: number;
    reserved_plots?: number;
    partially_allocated_plots?: number;
}

export function EstateCard({ estate }: { estate: Estate }) {
    const [imageError, setImageError] = useState(false);

    // Calculate plot counts
    const sold = estate.occupied_plots ||
        Math.max(0, estate.total_plots - estate.available_plots);

    const reserved = estate.reserved_plots || 0;
    const partiallyAllocated = estate.partially_allocated_plots || 0;

    // Defensive check: Ensure image_urls is an array
    const mainImage = Array.isArray(estate.image_urls) && estate.image_urls.length > 0 ? estate.image_urls[0] : null;

    return (
        <Card className="overflow-hidden shadow-soft-saas hover:shadow-lg transition-all duration-200 group mb-6 break-inside-avoid">
            <div className="relative h-48 bg-muted w-full overflow-hidden">
                {!imageError && mainImage ? (
                    <img
                        src={mainImage}
                        alt={estate.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-indigo-200">
                        <MapPin className="h-12 w-12 opacity-20" />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <EstateStatusBadge
                        status={estate.status || "active"}
                        className="bg-white/90 backdrop-blur-sm shadow-sm"
                    />
                </div>

                {/* Available Count Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm shadow-sm px-3 py-1 rounded-full">
                    <span className="text-xs font-semibold text-foreground">
                        {estate.available_plots} Available
                    </span>
                </div>
            </div>

            <CardContent className="p-5">
                <div className="mb-4">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-brand-primary transition-colors">
                            {estate.name}
                        </h3>
                        {estate.code && (
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                {estate.code}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {estate.location}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold tracking-tight">₦{estate.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase">Per Plot</span>
                    </div>

                    {/* New Inventory Bar */}
                    <EstateInventoryBar
                        totalPlots={estate.total_plots}
                        availablePlots={estate.available_plots}
                        reservedPlots={reserved}
                        soldPlots={sold}
                        partiallyAllocatedPlots={partiallyAllocated}
                        showLabels={false}
                    />

                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Occupancy</span>
                        <span>{sold + reserved + partiallyAllocated} / {estate.total_plots} Plots</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Button asChild className="w-full" variant="outline">
                    <Link href={`/dashboard/estates/${estate.id}`}>Manage Estate</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
