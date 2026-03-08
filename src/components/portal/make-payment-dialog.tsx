"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Building2, Smartphone, AlertCircle, CheckCircle2 } from "lucide-react";

interface Allocation {
    id: string;
    estate_name: string;
    plot_number: string;
    outstanding_balance: number;
}

interface MakePaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allocations: Allocation[];
    customerId: string;
    onPaymentComplete?: () => void;
}

type PaymentMethod = 'bank_transfer' | 'card' | 'ussd';

export function MakePaymentDialog({
    open,
    onOpenChange,
    allocations,
    customerId,
    onPaymentComplete
}: MakePaymentDialogProps) {
    const [step, setStep] = useState<'select' | 'amount' | 'method' | 'confirm' | 'success'>('select');
    const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after animation
        setTimeout(() => {
            setStep('select');
            setSelectedAllocation(null);
            setAmount('');
            setPaymentMethod('bank_transfer');
        }, 300);
    };

    const handleSelectAllocation = (alloc: Allocation) => {
        setSelectedAllocation(alloc);
        setAmount(alloc.outstanding_balance.toString());
        setStep('amount');
    };

    const handleAmountNext = () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (selectedAllocation && numAmount > selectedAllocation.outstanding_balance) {
            toast.error("Amount exceeds outstanding balance");
            return;
        }
        setStep('method');
    };

    const handleMethodNext = () => {
        setStep('confirm');
    };

    const handleConfirmPayment = async () => {
        setLoading(true);
        try {
            // For bank transfer, we just show instructions
            // For card/USSD, we would integrate with payment gateway

            if (paymentMethod === 'bank_transfer') {
                // Just show success with bank details
                setStep('success');
            } else {
                // Placeholder for payment gateway integration
                // In production, this would call Paystack/Flutterwave API
                toast.info("Online payment gateway integration coming soon. Please use bank transfer for now.");
                setStep('success');
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 'select':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Select the property you want to make a payment for:
                        </p>
                        <div className="space-y-2">
                            {allocations.filter(a => a.outstanding_balance > 0).map(alloc => (
                                <Card
                                    key={alloc.id}
                                    className="cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => handleSelectAllocation(alloc)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{alloc.estate_name}</p>
                                                <p className="text-sm text-muted-foreground">Plot #{alloc.plot_number}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Outstanding</p>
                                                <p className="font-bold text-orange-600">{formatCurrency(alloc.outstanding_balance)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {allocations.filter(a => a.outstanding_balance > 0).length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                                    <p>All payments are up to date!</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'amount':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Property</p>
                            <p className="font-medium">{selectedAllocation?.estate_name} - Plot #{selectedAllocation?.plot_number}</p>
                            <p className="text-sm mt-2">Outstanding: <span className="font-bold text-orange-600">{formatCurrency(selectedAllocation?.outstanding_balance || 0)}</span></p>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Amount</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                            />
                            <p className="text-xs text-muted-foreground">
                                You can pay the full amount or a partial payment.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                            <Button className="flex-1" onClick={handleAmountNext}>Continue</Button>
                        </div>
                    </div>
                );

            case 'method':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="flex justify-between">
                                <span>Property:</span>
                                <span className="font-medium">{selectedAllocation?.estate_name}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span>Amount:</span>
                                <span className="font-bold text-brand-purple">{formatCurrency(parseFloat(amount) || 0)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Payment Method</Label>
                            <div className="grid gap-2">
                                <Card
                                    className={`cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                                    onClick={() => setPaymentMethod('bank_transfer')}
                                >
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="font-medium">Bank Transfer</p>
                                            <p className="text-xs text-muted-foreground">Transfer to our bank account</p>
                                        </div>
                                        <Badge variant="secondary">Recommended</Badge>
                                    </CardContent>
                                </Card>
                                <Card
                                    className={`cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="font-medium">Debit/Credit Card</p>
                                            <p className="text-xs text-muted-foreground">Pay securely with your card</p>
                                        </div>
                                        <Badge variant="outline">Coming Soon</Badge>
                                    </CardContent>
                                </Card>
                                <Card
                                    className={`cursor-pointer transition-all ${paymentMethod === 'ussd' ? 'border-primary ring-2 ring-primary/20' : ''}`}
                                    onClick={() => setPaymentMethod('ussd')}
                                >
                                    <CardContent className="p-4 flex items-center gap-3">
                                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="font-medium">USSD</p>
                                            <p className="text-xs text-muted-foreground">Pay using USSD code</p>
                                        </div>
                                        <Badge variant="outline">Coming Soon</Badge>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('amount')}>Back</Button>
                            <Button className="flex-1" onClick={handleMethodNext}>Continue</Button>
                        </div>
                    </div>
                );

            case 'confirm':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Property:</span>
                                <span className="font-medium">{selectedAllocation?.estate_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Plot:</span>
                                <span>#{selectedAllocation?.plot_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-bold text-brand-purple text-lg">{formatCurrency(parseFloat(amount) || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
                            </div>
                        </div>

                        {paymentMethod === 'bank_transfer' && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="font-medium text-blue-800 mb-2">Bank Transfer Details</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Bank:</span>
                                        <span className="font-medium">First Bank</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Account Name:</span>
                                        <span className="font-medium">Acrely Properties Ltd</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Account Number:</span>
                                        <span className="font-mono font-bold">2034567890</span>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 mt-3">
                                    Please use your name and plot number as payment reference.
                                </p>
                            </div>
                        )}

                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                After payment, please allow 24-48 hours for verification. You will receive a confirmation email.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('method')}>Back</Button>
                            <Button className="flex-1" onClick={handleConfirmPayment} disabled={loading}>
                                {loading ? "Processing..." : "Confirm Payment"}
                            </Button>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center space-y-4 py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Payment Initiated!</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {paymentMethod === 'bank_transfer'
                                    ? "Please complete the bank transfer using the details provided."
                                    : "Your payment has been submitted for processing."
                                }
                            </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Amount to pay</p>
                            <p className="text-2xl font-bold text-brand-purple">{formatCurrency(parseFloat(amount) || 0)}</p>
                        </div>
                        <Button onClick={handleClose} className="w-full">Done</Button>
                    </div>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select' && 'Make a Payment'}
                        {step === 'amount' && 'Enter Amount'}
                        {step === 'method' && 'Payment Method'}
                        {step === 'confirm' && 'Confirm Payment'}
                        {step === 'success' && 'Payment Submitted'}
                    </DialogTitle>
                    {step !== 'success' && (
                        <DialogDescription>
                            {step === 'select' && 'Select a property to make a payment'}
                            {step === 'amount' && 'Enter the amount you want to pay'}
                            {step === 'method' && 'Choose how you want to pay'}
                            {step === 'confirm' && 'Review and confirm your payment'}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {renderStepContent()}
            </DialogContent>
        </Dialog>
    );
}
