"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Download, Mail, CheckCircle2 } from "lucide-react";
import { recordPaymentAction } from "@/lib/actions/payment-actions";

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    allocationId?: string;
    onSuccess?: () => void;
}

export function PaymentModal({ open, onOpenChange, allocationId, onSuccess }: PaymentModalProps) {
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [reference, setReference] = useState("");
    const [method, setMethod] = useState("bank_transfer");
    const [loading, setLoading] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");

    // Receipt generation state
    const [generateReceipt, setGenerateReceipt] = useState(true);
    const [sendEmail, setSendEmail] = useState(true);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [generatingReceipt, setGeneratingReceipt] = useState(false);

    // Prediction state
    const [prediction, setPrediction] = useState<string | null>(null);
    const [installments, setInstallments] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<string | null>(null);

    const router = useRouter();

    // Fetch plan details when modal opens or allocationId changes
    useEffect(() => {
        if (open && allocationId) {
            setPaymentSuccess(false);
            setReceiptData(null);

            const fetchPlan = async () => {
                // Fetch allocation details (customer name and email)
            };
            fetchPlan();
        } else {
            setInstallments([]);
            setPrediction(null);
            setAmount("");
            setCustomerName("");
            setCustomerEmail("");
            setPaymentSuccess(false);
            setReceiptData(null);
        }
    }, [open, allocationId]);

    // Calculate prediction when amount changes
    useEffect(() => {
        if (!amount || isNaN(parseFloat(amount)) || installments.length === 0) {
            setPrediction(null);
            return;
        }

        let remaining = parseFloat(amount);
        const summary = [];

        // Loop purely for calculation
        // Create a deep copy to not mutate state (though we are just reading)
        // Installments are sorted by due date
        for (const inst of installments) {
            if (remaining <= 0) break;
            if (inst.status === 'paid') continue;

            const owed = inst.amount_due - inst.amount_paid;
            // Round owed to 2 decimals to avoid float issues
            const owedFixed = Math.round(owed * 100) / 100;

            if (remaining >= owedFixed) {
                summary.push(`Complete #${inst.installment_number}`);
                remaining -= owedFixed;
            } else {
                summary.push(`Partially pay #${inst.installment_number}`);
                remaining = 0;
            }
        }

        if (summary.length > 0) {
            setPrediction(`This payment will: ${summary.join(" and ")}.`);
        } else if (installments.every(i => i.status === 'paid')) {
            setPrediction("All installments are already paid! This will be an overpayment.");
        } else {
            setPrediction("Amount to small/No pending installments found.");
        }

    }, [amount, installments]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!allocationId) {
                toast.error("Allocation ID is required for recording payment.");
                return;
            }

            // Secure server-side payment recording
            const result = (await recordPaymentAction({
                allocationId,
                customerId,
                amount: parseFloat(amount),
                date,
                reference,
                method,
            })) as any;

            // Check wrapper success and data
            if (!result.success || !result.data?.payment) {
                const errorMsg = result.error?.message || "Failed to record payment";
                throw new Error(errorMsg);
            }

            const payment = result.data.payment;

            toast.success("Payment recorded successfully");
            setPaymentSuccess(true);

            // Generate receipt if checkbox is checked
            if (generateReceipt && payment) {
                await handleGenerateReceipt(payment.id);
            } else {
                // If not generating receipt, close modal and refresh
                setTimeout(() => {
                    onOpenChange(false);
                    if (onSuccess) onSuccess();
                    router.refresh();
                }, 1500);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to record payment");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReceipt = async (paymentId: string) => {
        setGeneratingReceipt(true);

        try {
            toast.error("Receipt generation is disabled.");
        } catch (error) {
            console.error("Receipt generation error:", error);
            toast.error("Failed to generate receipt");
        } finally {
            setGeneratingReceipt(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
        router.refresh();

        // Reset form
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        setReference("");
        setMethod("bank_transfer");
        setPaymentSuccess(false);
        setReceiptData(null);
    };

    return (
        <Dialog open={open} onOpenChange={paymentSuccess ? handleClose : onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {paymentSuccess ? "Payment Recorded Successfully!" : "Record Payment"}
                    </DialogTitle>
                    <DialogDescription>
                        {paymentSuccess ? (
                            <span className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                Payment has been recorded and saved.
                            </span>
                        ) : (
                            <>Manually record a payment received from {customerName ? <span className="font-semibold text-primary">{customerName}</span> : "a customer"}.</>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {paymentSuccess ? (
                    // Success State - Show Receipt Actions
                    <div className="py-6 space-y-4">
                        {generatingReceipt && (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">Generating receipt...</p>
                            </div>
                        )}

                        {receiptData && !generatingReceipt && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-green-900">Receipt Generated</p>
                                        <p className="text-sm text-green-700 mt-1">
                                            Receipt Number: <span className="font-mono font-semibold">{receiptData.receiptNumber}</span>
                                        </p>
                                        {sendEmail && customerEmail && (
                                            <p className="text-sm text-green-700 mt-1">
                                                Email sent to {customerEmail}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(receiptData.signedUrl, "_blank")}
                                        className="flex-1"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Receipt
                                    </Button>
                                    {customerEmail && !sendEmail && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                // Resend email logic here
                                                toast.info("Resending email...");
                                            }}
                                        >
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Email
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!generateReceipt && !generatingReceipt && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900">
                                    Payment recorded without receipt generation.
                                </p>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    // Payment Form
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Amount
                            </Label>
                            <div className="col-span-3 space-y-2">
                                <Input
                                    id="amount"
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                                {prediction && (
                                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                        {prediction}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Date
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="method" className="text-right">
                                Method
                            </Label>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="pos">POS</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reference" className="text-right">
                                Reference
                            </Label>
                            <Input
                                id="reference"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                className="col-span-3"
                                placeholder="Transaction ID / Receipt No."
                            />
                        </div>

                        {/* Receipt Generation Options */}
                        <div className="border-t pt-4 mt-2">
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="generateReceipt"
                                        checked={generateReceipt}
                                        onCheckedChange={(checked) => setGenerateReceipt(checked as boolean)}
                                    />
                                    <Label
                                        htmlFor="generateReceipt"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Generate receipt automatically
                                    </Label>
                                </div>

                                {generateReceipt && customerEmail && (
                                    <div className="flex items-center space-x-2 ml-6">
                                        <Checkbox
                                            id="sendEmail"
                                            checked={sendEmail}
                                            onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                                        />
                                        <Label
                                            htmlFor="sendEmail"
                                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground"
                                        >
                                            Send receipt to customer email
                                        </Label>
                                    </div>
                                )}

                                {generateReceipt && !customerEmail && (
                                    <p className="text-xs text-muted-foreground ml-6">
                                        Customer email not available - receipt will not be sent
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Recording..." : "Save Payment"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
