"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createEstateAction } from "@/lib/actions/estate-actions";

export function CreateEstateClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        price: "",
        total_plots: "",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createEstateAction({
                name: formData.name,
                location: formData.location,
                price: parseFloat(formData.price),
                totalPlots: parseInt(formData.total_plots),
                description: formData.description
            });

            if (result?.success) {
                toast.success("Estate created successfully");
                router.push("/dashboard/estates");
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to create estate";
                throw new Error(errorMessage);
            }

        } catch (e: any) {
            toast.error(e.message || "Failed to create estate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Estate</CardTitle>
                    <CardDescription>Add a new property to your portfolio.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Estate Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Sunset Gardens" />
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required placeholder="e.g. Ibeju Lekki, Lagos" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price per Plot (₦)</Label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Plots</Label>
                                <Input type="number" value={formData.total_plots} onChange={e => setFormData({ ...formData, total_plots: e.target.value })} required max={500} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Estate"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
