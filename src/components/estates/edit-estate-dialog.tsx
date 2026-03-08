"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateEstateAction } from "@/lib/actions/estate-actions";

interface EditEstateDialogProps {
    estate: any;
    onUpdate: (updatedEstate: any) => void;
}

export function EditEstateDialog({ estate, onUpdate }: EditEstateDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: estate.name,
        location: estate.location,
        price: estate.price,
        total_plots: estate.total_plots || 0,
        status: estate.status || 'active'
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateEstateAction({
                id: estate.id,
                updates: {
                    name: formData.name,
                    location: formData.location,
                    price: Number(formData.price),
                    total_plots: Number(formData.total_plots),
                    status: formData.status
                }
            });

            if (result.success && result.data?.estate) {
                toast.success("Estate updated successfully");
                onUpdate(result.data.estate);
                setOpen(false);
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to update estate";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to update estate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-black hover:bg-zinc-100 border-none shadow-xl">
                    Edit Estate
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Estate</DialogTitle>
                    <DialogDescription>
                        Update the estate details and pricing.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                            Location
                        </Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price (₦)
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="total_plots" className="text-right">
                            Total Plots
                        </Label>
                        <Input
                            id="total_plots"
                            type="number"
                            min="0"
                            value={formData.total_plots}
                            onChange={(e) => setFormData({ ...formData, total_plots: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="sold_out">Sold Out</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
