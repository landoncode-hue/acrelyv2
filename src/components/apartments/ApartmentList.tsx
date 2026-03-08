"use client";

import { useState } from "react";
import { Building2, Plus, Search, MapPin, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Apartment {
    id: string;
    name: string;
    location: string | null;
    price: number;
    amenities: string[];
    media: {
        images: string[];
        videos: string[];
    };
    created_at: string;
}

export function ApartmentList({ initialApartments }: { initialApartments: Apartment[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredApartments = initialApartments.filter(
        (apt) =>
            apt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search apartments..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button asChild>
                    <Link href="/dashboard/apartments/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Apartment
                    </Link>
                </Button>
            </div>

            {filteredApartments.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">No apartments found</CardTitle>
                    <CardDescription className="mt-2">
                        Get started by creating your first apartment.
                    </CardDescription>
                    <Button asChild className="mt-6" variant="outline">
                        <Link href="/dashboard/apartments/new">Add Apartment</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredApartments.map((apt) => (
                        <Card key={apt.id} className="overflow-hidden">
                            <div className="aspect-video relative bg-muted">
                                {apt.media.images?.[0] ? (
                                    <img
                                        src={apt.media.images[0]}
                                        alt={apt.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Building2 className="h-12 w-12 text-muted-foreground/20" />
                                    </div>
                                )}
                            </div>
                            <CardHeader className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg line-clamp-1">{apt.name}</CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            <span className="line-clamp-1">{apt.location || "No location"}</span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/apartments/${apt.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-bold">
                                        {formatCurrency(apt.price)}
                                    </div>
                                    <div className="flex gap-1 overflow-hidden">
                                        {apt.amenities.slice(0, 2).map((amenity, i) => (
                                            <Badge key={i} variant="secondary" className="text-[10px]">
                                                {amenity}
                                            </Badge>
                                        ))}
                                        {apt.amenities.length > 2 && (
                                            <Badge variant="secondary" className="text-[10px]">
                                                +{apt.amenities.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
