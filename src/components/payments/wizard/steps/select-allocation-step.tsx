"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Home, Calendar, Clock, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentWizardData } from "../payment-wizard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface StepProps {
    data: PaymentWizardData;
    updateData: (data: Partial<PaymentWizardData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function SelectAllocationStep({ data, updateData, onNext, onBack }: StepProps) {
    const [customers, setCustomers] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const fetchInitialData = useCallback(async () => {
        setLoading(true);

        setLoading(false);
    }, [data.customerId]);

    useEffect(() => {
        const init = async () => {
            await fetchInitialData();
        };
        void init();
    }, [fetchInitialData]);

    const fetchAllocations = useCallback(async () => {
        if (!data.customerId) return;

        setLoading(true);
        setLoading(false);
    }, [data.customerId, data.allocationId, data.allocationDetails, updateData]);

    useEffect(() => {
        const init = async () => {
            await fetchAllocations();
        };
        void init();
    }, [fetchAllocations]);

    const handleCustomerChange = (val: string) => {
        const customer = customers.find(c => c.id === val);
        updateData({
            customerId: val,
            customerName: customer?.full_name,
            allocationId: "", // Reset allocation
            allocationDetails: undefined
        });
    };

    const handleAllocationChange = (val: string) => {
        const alloc = allocations.find(a => a.id === val);
        if (alloc) {
            const estates = alloc.estates as any;
            const plots = alloc.plots as any;
            const estateName = Array.isArray(estates) ? estates[0]?.name : estates?.name;
            const plotNumber = Array.isArray(plots) ? plots[0]?.plot_number : plots?.plot_number;
            updateData({
                allocationId: val,
                allocationDetails: `${estateName || 'Unknown'} - Plot ${plotNumber || 'TBD'}`
            });
        } else {
            updateData({
                allocationId: val,
                allocationDetails: undefined
            });
        }
    };

    if (loading && !customers.length) return <Skeleton className="h-[200px] w-full" />;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Customer</Label>
                    <Select value={data.customerId} onValueChange={handleCustomerChange}>
                        <SelectTrigger className="h-12" data-testid="customer-select">
                            <SelectValue placeholder="Select Customer" />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Allocation Plan</Label>
                    <Select value={data.allocationId} onValueChange={handleAllocationChange} disabled={!data.customerId}>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder={!data.customerId ? "Select Customer First" : "Select Allocation"} />
                        </SelectTrigger>
                        <SelectContent>
                            {allocations.map(a => (
                                <SelectItem key={a.id} value={a.id}>
                                    <div className="flex items-center gap-2">
                                        <span>{a.estates?.name} - Plot {a.plots?.plot_number || 'TBD'}</span>
                                        <Badge variant="outline" className="text-[10px]">{a.status}</Badge>
                                    </div>
                                </SelectItem>
                            ))}
                            {allocations.length === 0 && data.customerId && (
                                <SelectItem value="none" disabled>No active allocations found</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {data.paymentType !== 'installment' && (
                        <p className="text-[10px] text-muted-foreground">
                            Even for one-off payments, you must select the allocation this payment applies to.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                {/* Allow going back to Type selection */}
                <Button variant="ghost" onClick={onBack}>Back</Button>

                <Button
                    onClick={onNext}
                    disabled={!data.customerId || !data.allocationId}
                >
                    Next: Payment Details
                </Button>
            </div>
        </div>
    );
}
