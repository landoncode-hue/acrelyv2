"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";

// Steps
import { SelectTypeStep } from "./steps/select-type-step";
import { SelectAllocationStep } from "./steps/select-allocation-step";
import { PaymentDetailsStep } from "./steps/payment-details-step";
import { ReviewPaymentStep } from "./steps/review-payment-step";
import { recordPaymentAction } from "@/lib/actions/payment-actions";

export type PaymentWizardData = {
    paymentType: 'installment' | 'one_off' | 'other';
    customerId: string;
    customerName?: string;
    allocationId: string;
    allocationDetails?: string; // "Estate - Plot"
    amount: string;
    method: string;
    reference: string;
    date: Date;
    notes: string;
};

const INITIAL_DATA: PaymentWizardData = {
    paymentType: 'installment',
    customerId: "",
    allocationId: "",
    amount: "",
    method: "bank_transfer",
    reference: "",
    date: new Date(),
    notes: ""
};

const STEPS = [
    { id: 'type', title: 'Type' },
    { id: 'context', title: 'Context' },
    { id: 'details', title: 'Details' },
    { id: 'review', title: 'Review' }
];

export function PaymentWizardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { profile } = useProfile();

    const [step, setStep] = useState(0);
    const [data, setData] = useState<PaymentWizardData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);

    // Bootstrap from URL
    useEffect(() => {
        const newData = { ...INITIAL_DATA };
        const aid = searchParams.get("allocationId");
        const cid = searchParams.get("customerId");

        if (aid) {
            newData.allocationId = aid;
            newData.paymentType = 'installment'; // Logic: if allocation provided, assume installment
        }
        if (cid) newData.customerId = cid;

        setData(d => ({ ...d, ...newData }));

        // If allocation is provided, we could verify it and maybe skip step 0 if we are sure?
        // But for now let's keep it manual for safety.
    }, [searchParams]);

    const updateData = (updates: Partial<PaymentWizardData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
    const handleBack = () => setStep(s => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        if (!profile?.id) {
            toast.error("User profile not loaded. Please refresh.");
            return;
        }

        setLoading(true);
        try {
            // Clean amount (remove commas if any)
            const cleanAmount = data.amount.toString().replace(/,/g, '');
            const parsedAmount = parseFloat(cleanAmount);

            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                toast.error("Please enter a valid amount");
                setLoading(false);
                return;
            }

            const result = await recordPaymentAction({
                amount: parsedAmount,
                customerId: data.customerId,
                allocationId: data.allocationId,
                method: data.method,
                reference: data.reference,
                date: data.date.toISOString()
            });

            if (result.success) {
                toast.success("Payment recorded successfully");
                router.push('/dashboard/payments');
            } else {
                toast.error(result.error as string || "Payment failed");
            }
        } catch (error: any) {
            console.error("Payment Submission Error:", error);
            toast.error(error.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    // Skip "Context" step if type is One-off (and we already have customer?) 
    // Actually, One-off usually means "General payment" or "Unassigned". 
    // If Installment, we NEED Allocation. If One-off, we NEED Customer.
    // Let's handle logic in components or just use generic container.

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Progress Stepper */}
            <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-brand-purple -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between z-10 px-2">
                    {STEPS.map((s, i) => {
                        const isCompleted = i < step;
                        const isCurrent = i === step;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white text-xs font-bold
                                    ${isCompleted ? 'border-brand-purple bg-brand-purple text-white' : ''}
                                    ${isCurrent ? 'border-brand-purple text-brand-purple ring-4 ring-brand-purple/10' : ''}
                                    ${!isCompleted && !isCurrent ? 'border-zinc-200 text-zinc-400' : ''}
                                `}>
                                    {isCompleted ? <Check className="h-4 w-4" /> : <span>{i + 1}</span>}
                                </div>
                                <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${isCurrent ? 'text-brand-purple' : 'text-zinc-500'}`}>
                                    {s.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{STEPS[step].title}</CardTitle>
                    <CardDescription>Step {step + 1}: {STEPS[step].title}</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 0 && <SelectTypeStep data={data} updateData={updateData} onNext={handleNext} />}
                    {step === 1 && <SelectAllocationStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
                    {step === 2 && <PaymentDetailsStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
                    {step === 3 && <ReviewPaymentStep data={data} onSubmit={handleSubmit} onBack={handleBack} loading={loading} />}
                </CardContent>
            </Card>
        </div>
    );
}

export function PaymentWizard() {
    return (
        <Suspense>
            <PaymentWizardContent />
        </Suspense>
    )
}
