"use client";

import { Button } from "@/components/ui/button";
import { PaymentWizardData } from "../payment-wizard";
import { CreditCard, Banknote, Layers } from "lucide-react";

interface StepProps {
    data: PaymentWizardData;
    updateData: (data: Partial<PaymentWizardData>) => void;
    onNext: () => void;
}

export function SelectTypeStep({ data, updateData, onNext }: StepProps) {
    const handleSelect = (type: PaymentWizardData['paymentType']) => {
        updateData({
            paymentType: type,
            // Reset dependent fields if switching types drastically? 
            // Maybe keep context if it makes sense.
        });
        onNext();
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Button
                variant="outline"
                className="h-auto py-8 flex flex-col gap-4 items-center justify-center hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-wrap text-center"
                onClick={() => handleSelect('installment')}
            >
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Layers className="h-6 w-6" />
                </div>
                <div>
                    <span className="block font-bold text-base">Installment Payment</span>
                    <span className="text-xs text-muted-foreground font-normal mt-1">Pay towards an existing allocation plan</span>
                </div>
            </Button>

            <Button
                variant="outline"
                className="h-auto py-8 flex flex-col gap-4 items-center justify-center hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-wrap text-center"
                onClick={() => handleSelect('one_off')}
            >
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Banknote className="h-6 w-6" />
                </div>
                <div>
                    <span className="block font-bold text-base">One-off / Deposit</span>
                    <span className="text-xs text-muted-foreground font-normal mt-1">Initial deposit or outright payment</span>
                </div>
            </Button>

            <Button
                variant="outline"
                className="h-auto py-8 flex flex-col gap-4 items-center justify-center hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-wrap text-center"
                onClick={() => handleSelect('other')}
            >
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <CreditCard className="h-6 w-6" />
                </div>
                <div>
                    <span className="block font-bold text-base">Other Payment</span>
                    <span className="text-xs text-muted-foreground font-normal mt-1">Registration form, admin fees, etc.</span>
                </div>
            </Button>
        </div>
    );
}
