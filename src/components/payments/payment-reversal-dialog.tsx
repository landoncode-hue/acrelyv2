"use client";

import { useState } from "react";
import { reversePaymentAction } from "@/lib/actions/payment-actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface PaymentReversalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: {
        id: string;
        amount: number;
        payment_date: string;
        customer_name?: string;
        allocation_id?: string;
    };
    onSuccess?: () => void;
}

export function PaymentReversalDialog({
    open,
    onOpenChange,
    payment,
    onSuccess
}: PaymentReversalDialogProps) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReverse = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason for reversal");
            return;
        }

        setLoading(true);

        try {
            const result = await reversePaymentAction({
                paymentId: payment.id,
                reason: reason
            });

            if (result?.error) {
                const errorMsg = typeof result.error === 'string'
                    ? result.error
                    : JSON.stringify(result.error);
                throw new Error(errorMsg);
            }

            toast.success("Payment reversed successfully");
            setReason("");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Reversal error:", error);
            toast.error(error.message || "Failed to reverse payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Reverse Payment</DialogTitle>
                    <DialogDescription>
                        This action will reverse the payment and adjust all related balances.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Warning Alert */}
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Warning:</strong> This action cannot be undone. The payment will be marked as reversed
                            and all balances will be recalculated.
                        </AlertDescription>
                    </Alert>

                    {/* Payment Details */}
                    <div className="bg-zinc-50 border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Payment Date</span>
                            <span className="font-medium">
                                {new Date(payment.payment_date).toLocaleDateString()}
                            </span>
                        </div>
                        {payment.customer_name && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Customer</span>
                                <span className="font-medium">{payment.customer_name}</span>
                            </div>
                        )}
                    </div>

                    {/* Impact Preview */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Impact</Label>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Payment status will be set to "Reversed"</li>
                            <li>Allocation balance will be increased by {formatCurrency(payment.amount)}</li>
                            <li>Installment balances will be recalculated</li>
                            <li>Customer will be notified via email</li>
                            <li>Audit log will be created</li>
                        </ul>
                    </div>

                    {/* Reversal Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Reason for Reversal <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Explain why this payment is being reversed..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            This reason will be recorded in the audit log and sent to the customer.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReverse}
                        disabled={loading || !reason.trim()}
                    >
                        {loading ? "Reversing..." : "Reverse Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
