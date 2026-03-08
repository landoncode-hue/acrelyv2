"use client";

import { useState, useEffect } from "react";
import { getAgentsAction } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WizardData } from "../allocation-wizard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface StepProps {
    data: WizardData;
    updateData: (data: Partial<WizardData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PlanDetailsStep({ data, updateData, onNext, onBack }: StepProps) {
    const [agents, setAgents] = useState<any[]>([]);

    useEffect(() => {
        async function fetchAgents() {
            try {
                const result = await getAgentsAction();
                if (result?.success && result.data) {
                    setAgents(result.data);
                } else {
                    toast.error("Failed to fetch agents");
                }
            } catch (error) {
                toast.error("An error occurred while fetching agents");
            }
        }
        fetchAgents();
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Payment Plan</Label>
                    <Select value={data.planType} onValueChange={(v) => updateData({ planType: v })}>
                        <SelectTrigger className="h-12" data-testid="plan-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="outright" data-testid="plan-outright">Outright Payment (One-off)</SelectItem>
                            <SelectItem value="3_months" data-testid="plan-3months">3 Months Plan</SelectItem>
                            <SelectItem value="6_months" data-testid="plan-6months">6 Months Plan</SelectItem>
                            <SelectItem value="12_months" data-testid="plan-12months">12 Months Plan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Plot Size</Label>
                    <Select value={data.plotSize} onValueChange={(v) => {
                        updateData({ plotSize: v });
                        // Reset suffix if switching back to full plot
                        if (v === 'full_plot') {
                            updateData({ preferredSuffix: undefined });
                        }
                    }}>
                        <SelectTrigger className="h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="full_plot">Full Plot (100% Price)</SelectItem>
                            <SelectItem value="half_plot">Half Plot (50% Price)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {data.plotSize === 'half_plot' && (
                    <div className="space-y-2">
                        <Label>Preferred Suffix (Optional)</Label>
                        <Select
                            value={data.preferredSuffix || "auto"}
                            onValueChange={(v) => updateData({ preferredSuffix: v === "auto" ? undefined : v })}
                        >
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Auto-assign" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="auto">Auto-assign (Next Available)</SelectItem>
                                <SelectItem value="A">Force "A" (First Half)</SelectItem>
                                <SelectItem value="B">Force "B" (Second Half)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label className="flex justify-between">
                        <span>Custom Price (Optional)</span>
                        <span className="text-xs text-muted-foreground font-normal">Overrides standard price</span>
                    </Label>
                    <Input
                        type="number"
                        placeholder="Enter custom amount..."
                        className="h-12"
                        value={data.customPrice || ''}
                        onChange={(e) => updateData({ customPrice: e.target.value ? Number(e.target.value) : undefined })}
                        data-testid="custom-price-input"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Sales Agent / Staff (Optional)</Label>
                <Select value={data.agentId} onValueChange={(v) => updateData({ agentId: v })}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select who facilitated this sale" />
                    </SelectTrigger>
                    <SelectContent>
                        {agents.map(a => (
                            <SelectItem key={a.id} value={a.id}>
                                {a.full_name} ({a.role})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                    placeholder="Any special conditions or comments..."
                    className="min-h-[100px]"
                    value={data.notes}
                    onChange={(e) => updateData({ notes: e.target.value })}
                />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Allocation Date (Optional)</Label>
                    <Input
                        type="date"
                        className="h-12 w-full"
                        value={data.allocationDate ? new Date(data.allocationDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateData({ allocationDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Leave blank to use today's date. Useful for backdating historical allocations.
                    </p>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={!data.planType || !data.plotSize}>
                    Review Allocation
                </Button>
            </div>
        </div >
    );
}
