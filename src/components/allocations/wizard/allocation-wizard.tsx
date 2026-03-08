"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

// Steps
import { SelectCustomerStep } from "./steps/select-customer-step";
import { SelectPlotStep } from "./steps/select-plot-step";
import { PlanDetailsStep } from "./steps/plan-details-step";
import { PaymentStep } from "./steps/payment-step";
import { ReviewStep } from "./steps/review-step";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useProfile } from "@/hooks/use-profile";

export type SelectedPlot = {
    id: string;
    plot_number: string;
    price: number;
    size: 'full_plot' | 'half_plot';
};

export type WizardData = {
    customerId: string;
    customerName?: string;
    estateId: string;
    estateName?: string;
    // Legacy single plot (kept for backward compatibility)
    plotId: string;
    plotNumber?: string;
    plotPrice?: number;
    // Multi-plot support
    selectedPlots: SelectedPlot[];
    planType: string;
    plotSize: string; // Default size for new plots
    agentId: string;
    notes: string;
    // Payment Fields
    initialPaymentAmount?: number;
    paymentMethod?: string;
    paymentReference?: string;
    paymentDate?: string;
    customPrice?: number;
    preferredSuffix?: string;
    allocationDate?: string;
};

const INITIAL_DATA: WizardData = {
    customerId: "",
    estateId: "",
    plotId: "",
    selectedPlots: [],
    planType: "outright",
    plotSize: "full_plot",
    agentId: "",
    notes: ""
};

const STEPS = [
    { id: 'customer', title: 'Customer' },
    { id: 'property', title: 'Property' },
    { id: 'terms', title: 'Terms' },
    { id: 'payment', title: 'Payment' },
    { id: 'review', title: 'Review' }
];

export function AllocationWizardContent({ prefilledData = {} }: { prefilledData?: Partial<WizardData> }) {
    const router = useRouter();
    const { profile } = useProfile();

    const [step, setStep] = useState(0);
    const [data, setData] = useState<WizardData>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('allocation-wizard');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return INITIAL_DATA;
                }
            }
        }
        return INITIAL_DATA;
    });
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    // Bootstrap from Props
    useEffect(() => {
        if (Object.keys(prefilledData).length > 0) {
            setData(prev => ({
                ...prev,
                ...prefilledData
            }));
        }
    }, []);

    const updateData = (updates: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    // Persist wizard data to sessionStorage
    useEffect(() => {
        sessionStorage.setItem('allocation-wizard', JSON.stringify(data));
    }, [data]);

    const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const handleBack = () => setStep(s => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setLoading(true);
        setSubmitStatus('Validating allocation...');
        try {
            // Calculate total price from selected plots or use custom/legacy pricing
            let plotsToAllocate: any[] = [];

            if (data.selectedPlots.length > 0) {
                plotsToAllocate = data.selectedPlots;
            } else if (data.plotId === 'unassigned') {
                // Special case for unassigned legacy records or deposits
                plotsToAllocate = [{ id: null, plot_number: 'Unassigned', price: data.customPrice || 0, size: data.plotSize }];
            } else if (data.plotId) {
                plotsToAllocate = [{ id: data.plotId, plot_number: data.plotNumber || '', price: data.plotPrice || 0, size: data.plotSize as 'full_plot' | 'half_plot' }];
            }

            const calculatedTotalPrice = plotsToAllocate.reduce((sum, p) => sum + p.price, 0);
            const finalTotalPrice = data.customPrice || calculatedTotalPrice || 0;

            const { createAllocation } = await import("@/lib/actions/allocation-actions");

            const result = await createAllocation({
                customerId: data.customerId,
                estateId: data.estateId,
                plots: plotsToAllocate.map(p => ({
                    id: p.id,
                    plot_number: p.plot_number,
                    price: p.price,
                    size: p.size,
                    preferredSuffix: data.preferredSuffix
                })),
                planType: data.planType,
                plotSize: data.plotSize as 'full_plot' | 'half_plot',
                agentId: data.agentId || null,
                notes: data.notes,
                allocationDate: data.allocationDate,
                initialPayment: (data.initialPaymentAmount && data.initialPaymentAmount > 0) ? {
                    amount: data.initialPaymentAmount,
                    method: data.paymentMethod || 'bank_transfer',
                    reference: data.paymentReference,
                    date: data.paymentDate
                } : undefined,
                customPrice: data.customPrice
            });

            if (!result || !result.success) {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to create allocation";
                throw new Error(errorMessage);
            }

            const successMessage = plotsToAllocate.length > 1
                ? `Created ${plotsToAllocate.length} independent allocation drafts`
                : "Allocation Draft Created";
            toast.success(successMessage);
            // Clear wizard data from sessionStorage on success
            sessionStorage.removeItem('allocation-wizard');
            router.push("/dashboard/allocations");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
            setSubmitStatus('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Progress Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-brand-purple -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between z-10">
                    {STEPS.map((s, i) => {
                        const isCompleted = i < step;
                        const isCurrent = i === step;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white
                                    ${isCompleted ? 'border-brand-purple bg-brand-purple text-white' : ''}
                                    ${isCurrent ? 'border-brand-purple text-brand-purple ring-4 ring-brand-purple/10' : ''}
                                    ${!isCompleted && !isCurrent ? 'border-zinc-200 text-zinc-400' : ''}
                                `}>
                                    {isCompleted ? <Check className="h-5 w-5" /> : <span>{i + 1}</span>}
                                </div>
                                <span className={`text-xs font-medium transition-colors ${isCurrent ? 'text-brand-purple' : 'text-zinc-500'}`}>
                                    {s.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card className="border shadow-lg">
                <CardHeader>
                    <CardTitle>{STEPS[step].title}</CardTitle>
                    <CardDescription>Step {step + 1} of {STEPS.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 0 && <SelectCustomerStep data={data} updateData={updateData} onNext={handleNext} />}
                    {step === 1 && <SelectPlotStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
                    {step === 2 && <PlanDetailsStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
                    {step === 3 && <PaymentStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
                    {step === 4 && <ReviewStep data={data} onSubmit={handleSubmit} onBack={handleBack} loading={loading} />}
                </CardContent>
            </Card>
        </div>
    );
}

export function AllocationWizard({ prefilledData }: { prefilledData?: any }) {
    return (
        <Suspense>
            <AllocationWizardContent prefilledData={prefilledData} />
        </Suspense>
    )
}
