"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAppointmentSchema } from "@/lib/validations/appointment";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createAppointmentAction } from "@/lib/actions/appointment-actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type AppointmentFormValues = z.infer<typeof CreateAppointmentSchema>;

interface AppointmentFormProps {
    apartments: { id: string; name: string }[];
    customers: { id: string; full_name: string }[];
    initialData?: Partial<AppointmentFormValues>;
}

export function AppointmentForm({ apartments, customers, initialData }: AppointmentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AppointmentFormValues>({
        // @ts-expect-error - Zod resolver type mismatch with strict form types
        resolver: zodResolver(CreateAppointmentSchema),
        defaultValues: {
            apartmentId: initialData?.apartmentId || "",
            customerId: initialData?.customerId || "",
            appointmentDate: initialData?.appointmentDate || new Date().toISOString().slice(0, 16),
            notes: initialData?.notes || "",
            status: initialData?.status || "scheduled",
        },
    });

    async function onSubmit(values: any) {
        const data = values as AppointmentFormValues;
        setIsLoading(true);
        try {
            const result = await createAppointmentAction(data);

            if (result.success) {
                toast.success("Appointment scheduled");
                router.push("/dashboard/appointments");
                router.refresh();
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : "Something went wrong";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("Failed to schedule appointment");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control as any}
                        name="customerId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a customer" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {customers.map((customer) => (
                                            <SelectItem key={customer.id} value={customer.id}>
                                                {customer.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="apartmentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apartment</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an apartment" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {apartments.map((apt) => (
                                            <SelectItem key={apt.id} value={apt.id}>
                                                {apt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control as any}
                        name="appointmentDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Appointment Date & Time</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="no_show">No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control as any}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any special instructions or notes..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                        Schedule Appointment
                    </Button>
                </div>
            </form>
        </Form>
    );
}
