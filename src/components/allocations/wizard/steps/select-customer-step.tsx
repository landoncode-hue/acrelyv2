"use client";

import { useState, useEffect } from "react";
import { getCustomersAction } from "@/lib/actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { WizardData } from "../allocation-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface StepProps {
    data: WizardData;
    updateData: (data: Partial<WizardData>) => void;
    onNext: () => void;
    onBack?: () => void;
}

export function SelectCustomerStep({ data, updateData, onNext }: StepProps) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCustomers() {
            setLoading(true);
            try {
                const result = await getCustomersAction();
                if (result?.success && result.data) {
                    setCustomers(result.data);
                } else {
                    toast.error("Failed to fetch customers");
                }
            } catch (error) {
                toast.error("An error occurred while fetching customers");
            } finally {
                setLoading(false);
            }
        }
        fetchCustomers();
    }, []);

    const handleSelect = (val: string) => {
        const customer = customers.find(c => c.id === val);
        updateData({
            customerId: val,
            customerName: customer?.full_name
        });
    };

    if (loading) return <Skeleton className="h-[200px] w-full" />;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer</Label>
                    <Combobox
                        options={customers.map(c => ({
                            value: c.id,
                            label: `${c.full_name} (${c.phone})`
                        }))}
                        value={data.customerId}
                        onSelect={handleSelect}
                        placeholder="Search for a customer..."
                        searchPlaceholder="Search customers..."
                        testId="customer-select"
                        inputTestId="customer-search"
                    />
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="h-px bg-zinc-200 flex-1" />
                    <span>or</span>
                    <div className="h-px bg-zinc-200 flex-1" />
                </div>

                <Button variant="outline" className="w-full h-12 dashed border-2" asChild>
                    <Link href="/dashboard/customers/new" target="_blank">
                        <UserPlus className="mr-2 h-4 w-4" /> Create New Customer
                    </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                    Opens in a new tab. Refresh this list after creating.
                </p>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onNext} disabled={!data.customerId} className="w-full md:w-auto px-8">
                    Continue to Property
                </Button>
            </div>
        </div>
    );
}
