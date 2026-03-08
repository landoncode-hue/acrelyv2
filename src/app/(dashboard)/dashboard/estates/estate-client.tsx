"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List as ListIcon } from "lucide-react";
import Link from "next/link";
import { EstateCard } from "@/components/features/estate-card";
import { EstateListView } from "@/components/features/estate-list-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export interface Estate {
    id: string;
    name: string;
    location: string;
    price: number;
    currency: string;
    total_plots: number;
    available_plots: number;
    occupied_plots: number;
    image_urls?: string[];
    status: string;
    created_at: string;
}

interface EstateClientProps {
    initialEstates: Estate[];
}

export function EstateClient({ initialEstates }: EstateClientProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedMode = localStorage.getItem("estatesViewMode");
        if (savedMode === "grid" || savedMode === "list") {
            setViewMode(savedMode);
        }
    }, []);

    const handleViewChange = (value: string) => {
        if (value) {
            setViewMode(value as "grid" | "list");
            localStorage.setItem("estatesViewMode", value);
        }
    };

    if (!mounted) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-10 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Estates"
                description="Manage your real estate portfolio, pricing, and allocations."
                actions={
                    <div className="flex items-center gap-4">
                        {initialEstates.length > 0 && (
                            <div className="bg-muted/50 p-1 rounded-lg border">
                                <Tabs value={viewMode} onValueChange={handleViewChange}>
                                    <TabsList className="h-8">
                                        <TabsTrigger value="grid" className="h-6 px-2">
                                            <LayoutGrid className="h-4 w-4" />
                                            <span className="sr-only">Grid View</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="list" className="h-6 px-2">
                                            <ListIcon className="h-4 w-4" />
                                            <span className="sr-only">List View</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        )}
                        <Button asChild className="gap-2">
                            <Link href="/dashboard/estates/new">
                                <Plus className="h-4 w-4" /> Add New Estate
                            </Link>
                        </Button>
                    </div>
                }
            />

            {initialEstates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-muted">
                    <p className="text-muted-foreground mb-4">No estates found. Create your first estate to get started.</p>
                    <Button asChild>
                        <Link href="/dashboard/estates/new">
                            <Plus className="h-4 w-4 mr-2" /> Add Estate
                        </Link>
                    </Button>
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            {initialEstates.map((estate) => (
                                <EstateCard key={estate.id} estate={{ ...estate, image_urls: estate.image_urls || [], status: estate.status as any }} />
                            ))}
                        </div>
                    ) : (
                        <EstateListView estates={initialEstates} loading={false} />
                    )}
                </>
            )}
        </div>
    );
}
