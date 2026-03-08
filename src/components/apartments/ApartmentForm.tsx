"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateApartmentSchema as ApartmentSchema } from "@/lib/validations/apartment";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createApartmentAction, updateApartmentAction } from "@/lib/actions/apartment-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ApartmentFormValues = z.infer<typeof ApartmentSchema>;

interface ApartmentFormProps {
    initialData?: ApartmentFormValues & { id: string };
}

export function ApartmentForm({ initialData }: ApartmentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [newAmenity, setNewAmenity] = useState("");

    const form = useForm<ApartmentFormValues>({
        // @ts-expect-error - Zod resolver type mismatch with strict form types
        resolver: zodResolver(ApartmentSchema),
        defaultValues: {
            name: initialData?.name || "",
            location: initialData?.location || "",
            amenities: initialData?.amenities || [],
            price: initialData?.price || 0,
            media: {
                images: initialData?.media?.images || [],
                videos: initialData?.media?.videos || []
            }
        },
    });

    async function onSubmit(values: any) {
        const data = values as ApartmentFormValues;
        setIsLoading(true);
        try {
            const result = initialData
                ? await updateApartmentAction({ ...data, id: initialData.id })
                : await createApartmentAction(data);

            if (result.success) {
                toast.success(initialData ? "Apartment updated" : "Apartment created");
                router.push("/dashboard/apartments");
                router.refresh();
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : "Something went wrong";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("Failed to save apartment");
        } finally {
            setIsLoading(false);
        }
    }

    const addAmenity = () => {
        if (!newAmenity) return;
        const currentAmenities = form.getValues("amenities") || [];
        if (!currentAmenities.includes(newAmenity)) {
            form.setValue("amenities", [...currentAmenities, newAmenity]);
        }
        setNewAmenity("");
    };

    const removeAmenity = (amenity: string) => {
        const currentAmenities = form.getValues("amenities") || [];
        form.setValue("amenities", currentAmenities.filter((a) => a !== amenity));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control as any}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apartment Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Ocean View Suite" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control as any}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control as any}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Lekki Phase 1, Lagos" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-4">
                    <FormLabel>Amenities</FormLabel>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add amenity (e.g. Swimming Pool)"
                            value={newAmenity}
                            onChange={(e) => setNewAmenity(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addAmenity();
                                }
                            }}
                        />
                        <Button type="button" variant="outline" onClick={addAmenity}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {form.watch("amenities")?.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="px-3 py-1">
                                {amenity}
                                <button
                                    type="button"
                                    onClick={() => removeAmenity(amenity)}
                                    className="ml-2 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Media</h3>
                    <FormDescription>
                        Enter URLs for images and videos of the apartment.
                    </FormDescription>

                    <div className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="media.images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Images (URLs)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Paste image URLs separated by commas"
                                            className="min-h-[100px]"
                                            value={field.value?.join(", ") || ""}
                                            onChange={(e) => field.onChange(e.target.value.split(",").map(url => url.trim()).filter(Boolean))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="media.videos"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Videos (URLs)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Paste video URLs separated by commas"
                                            className="min-h-[100px]"
                                            value={field.value?.join(", ") || ""}
                                            onChange={(e) => field.onChange(e.target.value.split(",").map(url => url.trim()).filter(Boolean))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Apartment" : "Create Apartment"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
