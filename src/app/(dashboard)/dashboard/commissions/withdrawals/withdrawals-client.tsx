"use client";

import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SmartTable, Column } from "@/components/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";
import { processWithdrawalRequest } from "@/lib/actions/agent-actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface WithdrawalManagementClientProps {
    initialRequests: any[];
}

export function WithdrawalManagementClient({ initialRequests }: WithdrawalManagementClientProps) {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>(initialRequests);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'paid' | null>(null);
    const [ref, setRef] = useState("");
    const [reason, setReason] = useState("");
    const [processing, setProcessing] = useState(false);

    const handleAction = async () => {
        if (!selectedRequest || !actionType) return;

        setProcessing(true);
        try {
            const res = await processWithdrawalRequest({
                requestId: selectedRequest.id,
                action: actionType,
                data: {
                    ref: actionType === 'paid' ? ref : undefined,
                    reason: actionType === 'reject' ? reason : undefined
                }
            });

            if (res?.success) {
                toast.success(`Request ${actionType === 'paid' ? 'marked as paid' : actionType + 'ed'}`);

                // Update local state to reflect the change immediately
                setRequests(prev => prev.map(req => {
                    if (req.id === selectedRequest.id) {
                        return { ...req, status: actionType === 'paid' ? 'paid' : actionType === 'approve' ? 'approved' : 'rejected' };
                    }
                    return req;
                }));

                setSelectedRequest(null);
                setActionType(null);
                setRef("");
                setReason("");
                router.refresh(); // Refresh to ensure data sync
            } else {
                const errorMessage = typeof res?.error === 'string' ? res.error : (res?.error as any)?.message || "Failed to process request";
                toast.error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to process request");
        } finally {
            setProcessing(false);
        }
    };

    const columns: Column<any>[] = [
        {
            header: "Agent",
            cell: (row) => (
                <div>
                    <div className="font-medium">{row.agents?.profiles?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{row.agents?.profiles?.email}</div>
                </div>
            )
        },
        {
            header: "Amount",
            cell: (row) => <span className="font-semibold">{formatCurrency(row.amount)}</span>
        },
        {
            header: "Bank Details",
            cell: (row) => (
                <div className="text-xs">
                    <div>{row.bank_name}</div>
                    <div className="font-mono text-muted-foreground">{row.account_number}</div>
                    <div className="italic">{row.account_name}</div>
                </div>
            )
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={
                    row.status === 'paid' ? 'success' :
                        row.status === 'approved' ? 'info' :
                            row.status === 'pending' ? 'warning' : 'destructive'
                }>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Date",
            cell: (row) => <span className="text-xs">{new Date(row.created_at).toLocaleDateString()}</span>
        },
        {
            header: "Action",
            className: "text-right",
            cell: (row) => (
                <div className="flex justify-end gap-2">
                    {row.status === 'pending' && (
                        <>
                            <Button size="sm" variant="outline" className="h-8 px-2 text-destructive border-destructive/20" onClick={() => { setSelectedRequest(row); setActionType('reject'); }}>
                                Reject
                            </Button>
                            <Button size="sm" className="h-8 px-2 bg-blue-600 hover:bg-blue-700" onClick={() => { setSelectedRequest(row); setActionType('approve'); }}>
                                Approve
                            </Button>
                        </>
                    )}
                    {row.status === 'approved' && (
                        <Button size="sm" className="h-8 px-2 bg-success hover:bg-success/90" onClick={() => { setSelectedRequest(row); setActionType('paid'); }}>
                            <CreditCard className="mr-2 h-3 w-3" />
                            Mark Paid
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Agent Withdrawals"
                description="Manage commission payout requests from agents."
            />

            <SmartTable
                data={requests}
                columns={columns}
                searchKey="status"
                searchPlaceholder="Filter by status..."
            />

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="capitalize">{actionType} Request</DialogTitle>
                        <DialogDescription>
                            {actionType === 'paid'
                                ? "Enter the payment transaction reference to complete this payout."
                                : `Are you sure you want to ${actionType} this withdrawal request of ${formatCurrency(selectedRequest?.amount)}?`}
                        </DialogDescription>
                    </DialogHeader>

                    {actionType === 'paid' && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Transaction Reference</Label>
                                <Input
                                    placeholder="e.g. TRF/BK/2026/01/..."
                                    value={ref}
                                    onChange={(e) => setRef(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {actionType === 'reject' && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Reason for Rejection</Label>
                                <Input
                                    placeholder="Optional reason..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedRequest(null)} disabled={processing}>Cancel</Button>
                        <Button
                            className={actionType === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
                            onClick={handleAction}
                            disabled={processing || (actionType === 'paid' && !ref)}
                        >
                            {processing ? "Processing..." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
