"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WizardData } from "../allocation-wizard";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface StepProps {
    data: WizardData;
    updateData: (data: Partial<WizardData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function PaymentStep({ data, updateData, onNext, onBack }: StepProps) {
    // Local state to manage "Record Payment" toggle? 
    // Or just check if amount > 0.
    // Let's use a checkbox for clarity.
    const [recordPayment, setRecordPayment] = useState(!!data.initialPaymentAmount && data.initialPaymentAmount > 0);
    const [amount, setAmount] = useState(data.initialPaymentAmount?.toString() || "");
    const [method, setMethod] = useState(data.paymentMethod || "bank_transfer");
    const [reference, setReference] = useState(data.paymentReference || "");
    const [date, setDate] = useState(data.paymentDate || (data.allocationDate ? new Date(data.allocationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]));

    useEffect(() => {
        if (!recordPayment) {
            updateData({
                initialPaymentAmount: 0,
                paymentMethod: undefined,
                paymentReference: undefined,
                paymentDate: undefined
            });
        } else {
            const numAmount = parseFloat(amount.replace(/,/g, ''));
            updateData({
                initialPaymentAmount: isNaN(numAmount) ? 0 : numAmount,
                paymentMethod: method,
                paymentReference: reference,
                paymentDate: date
            });
        }
    }, [recordPayment, amount, method, reference, date]);


    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center space-x-2 border p-4 rounded-lg bg-muted/20">
                    <Checkbox
                        id="record-payment"
                        checked={recordPayment}
                        onCheckedChange={(c) => setRecordPayment(!!c)}
                        data-testid="record-payment-checkbox"
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label
                            htmlFor="record-payment"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Record Initial Payment
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Check this if the customer is making a down payment or full payment now.
                        </p>
                    </div>
                </div>

                {recordPayment && (
                    <Card className="animate-in slide-in-from-top-2 fade-in">
                        <CardContent className="pt-6 grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Amount Paid (₦)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    data-testid="initial-amount-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger data-testid="payment-method-select">
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
                                <Label>Transaction Reference / Receipt No.</Label>
                                <Input
                                    placeholder="e.g. TRF-123456789"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    data-testid="initial-reference-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={onBack}>Back</Button>
                <Button onClick={onNext}>
                    Continue to Review
                </Button>
            </div>
        </div>
    );
}
