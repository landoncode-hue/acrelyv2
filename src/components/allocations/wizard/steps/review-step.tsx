"use client";

import { Button } from "@/components/ui/button";
import { WizardData } from "../allocation-wizard";
import { CheckCircle2 } from "lucide-react";

interface StepProps {
    data: WizardData;
    onSubmit: () => void;
    onBack: () => void;
    loading: boolean;
}

export function ReviewStep({ data, onSubmit, onBack, loading }: StepProps) {
    return (
        <div className="space-y-8">
            <div className="bg-zinc-50 border rounded-lg p-6 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Review Allocation Draft</h3>
                        <p className="text-zinc-500 text-sm">Please verify the details before creating this draft.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Customer</span>
                        <p className="font-medium text-base">{data.customerName || "Selected Customer"}</p>
                        <p className="text-zinc-400 text-xs font-mono">{data.customerId.slice(0, 8)}...</p>
                    </div>

                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Property</span>
                        <p className="font-medium text-base">{data.estateName || "Selected Estate"}</p>
                        {data.selectedPlots.length > 1 ? (
                            <div className="mt-2 space-y-1">
                                <p className="text-zinc-600 text-sm font-medium">{data.selectedPlots.length} Plots Selected:</p>
                                <div className="flex flex-wrap gap-1">
                                    {data.selectedPlots.map(plot => (
                                        <span key={plot.id} className="bg-white border rounded px-2 py-0.5 text-xs">
                                            #{plot.plot_number} ({plot.size === 'half_plot' ? '½' : 'Full'})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-600">Plot: {data.plotNumber || (data.plotId === 'unassigned' ? 'Unassigned' : 'Unknown')}</p>
                        )}
                    </div>

                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Conditions</span>
                        <div className="flex flex-col gap-1">
                            <span className="bg-white border rounded px-2 py-1 w-fit capitalize">{data.planType.replace('_', ' ')} Plan</span>
                            <span className="bg-white border rounded px-2 py-1 w-fit capitalize">{data.plotSize.replace('_', ' ')}</span>
                            {data.selectedPlots.length > 1 && (
                                <span className="bg-green-100 text-green-800 border border-green-200 rounded px-2 py-1 w-fit text-xs font-medium">
                                    Bulk Purchase ({data.selectedPlots.length} plots)
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Financials</span>
                        {data.selectedPlots.length > 1 ? (
                            <div className="space-y-2">
                                <div className="text-xs text-zinc-500">
                                    {data.selectedPlots.map(plot => (
                                        <div key={plot.id} className="flex justify-between">
                                            <span>Plot #{plot.plot_number}</span>
                                            <span>₦{plot.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-2 flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-lg text-brand-purple">
                                        ₦{data.selectedPlots.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="font-medium text-base">
                                {typeof data.plotPrice === 'number' ? `₦${data.plotPrice.toLocaleString()}` : 'Price TBD'}
                                {data.plotSize === 'half_plot' && ' (Half Plot)'}
                            </p>
                        )}
                    </div>

                    {data.notes && (
                        <div className="col-span-2">
                            <span className="block text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Notes</span>
                            <p className="bg-white border rounded p-3 text-zinc-600">{data.notes}</p>
                        </div>
                    )}

                    {data.initialPaymentAmount && data.initialPaymentAmount > 0 && (
                        <div className="col-span-2 bg-brand-purple/5 border border-brand-purple/20 rounded p-4">
                            <span className="block text-brand-purple text-xs uppercase font-bold tracking-wider mb-2">Initial Payment Recorded</span>
                            <div className="flex gap-8">
                                <div>
                                    <span className="text-xs text-muted-foreground">Amount</span>
                                    <p className="font-semibold text-lg">₦{data.initialPaymentAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Method</span>
                                    <p className="capitalize font-medium">{data.paymentMethod?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground">Date</span>
                                    <p className="font-medium">{data.paymentDate}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={onBack} disabled={loading}>Back</Button>
                <Button onClick={onSubmit} disabled={loading} size="lg" className="w-full md:w-auto px-8">
                    {loading ? "Creating Draft..." : "Confirm & Create Draft"}
                </Button>
            </div>
        </div>
    );
}
