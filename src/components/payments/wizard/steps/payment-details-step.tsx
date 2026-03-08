"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentWizardData } from "../payment-wizard";
import { Textarea } from "@/components/ui/textarea";

interface StepProps {
    data: PaymentWizardData;
    updateData: (data: Partial<PaymentWizardData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PaymentDetailsStep({ data, updateData, onNext, onBack }: StepProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Amount (₦)</Label>
                    <Input
                        type="number"
                        value={data.amount}
                        onChange={e => updateData({ amount: e.target.value })}
                        placeholder="0.00"
                        className="text-lg"
                        data-testid="amount-input"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Payment Date</Label>
                    {/* Simple date input for now, could use a DatePicker */}
                    <Input
                        type="date"
                        value={(() => {
                            try {
                                return data.date.toISOString().split('T')[0];
                            } catch {
                                return new Date().toISOString().split('T')[0];
                            }
                        })()}
                        onChange={e => {
                            const val = e.target.value;
                            // If cleared or invalid, default to today to keep state valid
                            const newDate = val ? new Date(val) : new Date();
                            const validDate = isNaN(newDate.getTime()) ? new Date() : newDate;
                            updateData({ date: validDate });
                        }}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={data.method} onValueChange={(v) => updateData({ method: v })}>
                        <SelectTrigger className="h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="pos">POS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Reference / Ref Number</Label>
                    <Input
                        value={data.reference}
                        onChange={e => updateData({ reference: e.target.value })}
                        placeholder="Transaction ID, Teller No, etc."
                        data-testid="reference-input"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                    value={data.notes}
                    onChange={e => updateData({ notes: e.target.value })}
                    placeholder="Any additional details..."
                />
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={!data.amount || parseFloat(data.amount) <= 0}>
                    Review Payment
                </Button>
            </div>
        </div>
    );
}
