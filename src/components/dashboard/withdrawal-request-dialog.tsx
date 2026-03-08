"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { requestWithdrawalAction } from "@/lib/actions/commission-actions";

interface WithdrawalRequestDialogProps {
    balance: number;
    onSuccess?: () => void;
}

export function WithdrawalRequestDialog({ balance, onSuccess }: WithdrawalRequestDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (numAmount > balance) {
            toast.error("Amount exceeds your available balance");
            return;
        }

        setLoading(true);
        try {
            const { error } = await (requestWithdrawalAction as any)({ amount: numAmount });
            if (error) {
                const errorMessage = typeof error === 'string' ? error : (error as any).message || JSON.stringify(error);
                throw new Error(errorMessage);
            }

            setSuccess(true);
            toast.success("Withdrawal request submitted");
            if (onSuccess) onSuccess();

            // Close after 2 seconds on success
            setTimeout(() => {
                setOpen(false);
                setSuccess(false);
                setAmount("");
            }, 2000);

        } catch (error: any) {
            toast.error(error.message || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0">
                    Request Withdrawal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <CheckCircle2 className="h-12 w-12 text-success animate-in zoom-in duration-300" />
                        <div>
                            <h3 className="text-lg font-semibold">Request Submitted</h3>
                            <p className="text-sm text-muted-foreground">
                                Your withdrawal request for ₦{parseFloat(amount).toLocaleString()} is being processed.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Request Withdrawal</DialogTitle>
                            <DialogDescription>
                                Submit a request to withdraw your earned commissions.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Available Balance</span>
                                <span className="font-bold">₦{balance.toLocaleString()}</span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">Withdrawal Amount (₦)</Label>
                                <div className="relative">
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-8"
                                        required
                                        min="1000"
                                        disabled={loading}
                                    />
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">₦</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    * Minimum withdrawal amount is ₦1,000
                                </p>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading || !amount}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
