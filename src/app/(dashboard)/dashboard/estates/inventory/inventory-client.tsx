"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { bulkCreatePlotsAction } from "@/lib/actions/estate-actions";
import { Estate } from "@/lib/repositories/types";

interface InventoryClientProps {
    initialEstates: Estate[];
}

export function InventoryClient({ initialEstates }: InventoryClientProps) {
    const [selectedEstate, setSelectedEstate] = useState<string>("");

    // Bulk Add State
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [prefix, setPrefix] = useState("");
    const [price, setPrice] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const handleBulkAdd = async () => {
        if (!selectedEstate || !rangeStart || !rangeEnd || !price) {
            toast.error("Please fill all required fields");
            return;
        }

        const start = parseInt(rangeStart);
        const end = parseInt(rangeEnd);

        if (isNaN(start) || isNaN(end) || start > end) {
            toast.error("Invalid range");
            return;
        }

        const count = end - start + 1;
        if (count > 100) {
            if (!confirm(`You are about to create ${count} plots. Continue?`)) return;
        }

        setActionLoading(true);
        try {
            const plotsToCreate = [];
            for (let i = start; i <= end; i++) {
                plotsToCreate.push({
                    plot_number: `${prefix}${i}`,
                    size: 500, // default size
                    price: parseFloat(price),
                    status: 'available' as const
                });
            }

            const result = await bulkCreatePlotsAction({
                estateId: selectedEstate,
                plots: plotsToCreate
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(`Successfully added ${count} plots`);
                setRangeStart("");
                setRangeEnd("");
            }
        } catch (e: any) {
            console.error(e);
            toast.error("Failed to add plots: " + e.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <PageHeader
                title="Bulk Inventory Management"
                description="Rapidly create or update plots for your estates."
            />

            <div className="w-full max-w-md">
                <Label>Select Estate</Label>
                <Select value={selectedEstate} onValueChange={setSelectedEstate}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select an estate..." />
                    </SelectTrigger>
                    <SelectContent>
                        {initialEstates.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedEstate && (
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Add Plots</CardTitle>
                            <CardDescription>Generate plot records in a sequence.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label>Prefix (Optional)</Label>
                                    <Input placeholder="e.g. PLOT-" value={prefix} onChange={e => setPrefix(e.target.value)} />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Price</Label>
                                    <Input type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label>Start Number</Label>
                                    <Input type="number" placeholder="1" value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>End Number</Label>
                                    <Input type="number" placeholder="50" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} />
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button className="w-full" onClick={handleBulkAdd} disabled={actionLoading}>
                                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Generate Plots
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="opacity-75 cursor-not-allowed relative overflow-hidden">
                        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                            <span className="text-sm font-medium bg-secondary px-3 py-1 rounded-full">Coming Soon</span>
                        </div>
                        <CardHeader>
                            <CardTitle>Bulk Update</CardTitle>
                            <CardDescription>Modify existing plots by range.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label>Start Number</Label>
                                    <Input disabled />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>End Number</Label>
                                    <Input disabled />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>New Price</Label>
                                <Input disabled />
                            </div>
                            <Button variant="secondary" className="w-full" disabled>
                                <RefreshCw className="mr-2 h-4 w-4" /> Update Plots
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
