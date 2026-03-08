"use client";

import { Button } from "@/components/ui/button";
import { PaymentWizardData } from "../payment-wizard";
import { CheckCircle2 } from "lucide-react";

interface StepProps {
    data: PaymentWizardData;
    onSubmit: () => void;
    onBack: () => void;
    loading: boolean;
}

export function ReviewPaymentStep({ data, onSubmit, onBack, loading }: StepProps) {
    return (
        <div className="space-y-8">
            <div className="bg-zinc-50 border rounded-lg p-6 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Verify Payment</h3>
                        <p className="text-zinc-500 text-sm">Review the details before recording this transaction.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Customer</span>
                        <p className="font-medium text-base">{data.customerName || "Selected Customer"}</p>
                    </div>

                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Payment Type</span>
                        <div className="flex items-center gap-2">
                            <span className="capitalize font-medium">{data.paymentType.replace('_', ' ')}</span>
                            {data.allocationDetails && (
                                <span className="text-zinc-500 text-xs">({data.allocationDetails})</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Amount</span>
                        <p className="font-bold text-2xl text-zinc-900">₦{parseFloat(data.amount).toLocaleString()}</p>
                    </div>

                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Details</span>
                        <p className="capitalize">{data.method.replace('_', ' ')}</p>
                        <p className="font-mono text-xs text-zinc-500">{data.reference || "No Reference"}</p>
                        <p className="text-zinc-500">{data.date.toLocaleDateString()}</p>
                    </div>

                    {data.notes && (
                        <div className="col-span-2">
                            <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Notes</span>
                            <p className="bg-white border rounded p-3 text-zinc-600">{data.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={onBack} disabled={loading}>Back</Button>
                <Button onClick={onSubmit} disabled={loading} size="lg" className="w-full md:w-auto px-8">
                    {loading ? "Processing..." : "Confirm Payment"}
                </Button>
            </div>
        </div>
    );
}
