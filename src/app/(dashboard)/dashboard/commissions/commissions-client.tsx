"use client";

import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestWithdrawalAction } from "@/lib/actions/commission-actions";

interface CommissionsClientProps {
    initialCommissions: any[];
    initialWithdrawals: any[];
    agentId?: string; // Optional, just for info if needed
}

export default function CommissionsClient({ initialCommissions, initialWithdrawals, agentId }: CommissionsClientProps) {
    // We can rely on initial props and router.refresh() from server action revalidation
    // But for better UX we might want local state that updates on action success if we returned data
    // For now, simplicity: relying on Next.js cache revalidation

    // Actually, local state is good for optimistic UI or if revalidation is slow? 
    // But simplest safely is just initial props. 
    // However, if we want the lists to update immediately without waiting for revalidation roundtrip (which is fast usually),
    // we can just stick to router.refresh().
    // NOTE: Props are read-only. We can copy to state if we want to manipulate client-side, 
    // but typically with Server Actions + revalidatePath, the page reloads with new props.

    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleRequestWithdrawal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const amount = parseFloat(withdrawAmount);
            if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");

            const result = await requestWithdrawalAction({ amount });

            if (result?.success) {
                toast.success("Withdrawal request submitted successfully");
                setWithdrawOpen(false);
                setWithdrawAmount("");
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to request withdrawal";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to request withdrawal");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Commissions & Withdrawals</h1>
                    <p className="text-muted-foreground">Track earnings and request payouts.</p>
                </div>
                {agentId && (
                    <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                        <DialogTrigger asChild>
                            <Button>Request Withdrawal</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Request Commission Withdrawal</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleRequestWithdrawal} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Amount (₦)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        min="1"
                                        step="0.01"
                                        value={withdrawAmount}
                                        onChange={e => setWithdrawAmount(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Requests are usually processed within 48 hours.
                                    </p>
                                </div>
                                <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? "Submitting..." : "Submit Request"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Commission History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Commission History</h2>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialCommissions.map((comm) => (
                                    <TableRow key={comm.id}>
                                        <TableCell className="font-medium">{formatCurrency(comm.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={comm.status === 'paid' ? 'success' : 'secondary'}>{comm.status}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(comm.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                                {initialCommissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No commission history.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Withdrawal Requests */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Withdrawal Requests</h2>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialWithdrawals.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{formatCurrency(req.amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={req.status === 'paid' ? 'success' : req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'outline'}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                                {initialWithdrawals.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            No withdrawal requests.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
