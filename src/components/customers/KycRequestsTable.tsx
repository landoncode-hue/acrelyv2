"use client";

import { useState, useEffect } from "react";
import { SmartTable, Column } from "@/components/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Check,
    X,
    ExternalLink
} from "lucide-react";
import { verifyKycAction } from "@/lib/actions/kyc-actions";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface KycRequestsTableProps {
    initialCustomers: any[];
}

export function KycRequestsTable({ initialCustomers }: KycRequestsTableProps) {
    const [customers, setCustomers] = useState<any[]>(initialCustomers);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [reason, setReason] = useState("");
    const [processing, setProcessing] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setCustomers(initialCustomers);
    }, [initialCustomers]);

    const handleVerify = async (customerId: string) => {
        setProcessing(true);
        const res = await verifyKycAction(customerId, 'verify');
        if (res.success) {
            toast.success("KYC Verified");
            // Optimistic update or just wait for revalidation
            // We can refresh the route to ensure we get the latest
            router.refresh();
            setSelectedCustomer(null);
        } else {
            toast.error(typeof res.error === 'string' ? res.error : (res.error?.message || "Verification failed"));
        }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!selectedCustomer) return;
        setProcessing(true);
        const res = await verifyKycAction(selectedCustomer.id, 'reject', reason);
        if (res.success) {
            toast.success("KYC Rejected");
            router.refresh();
            setShowRejectDialog(false);
            setSelectedCustomer(null);
            setReason("");
        } else {
            toast.error(typeof res.error === 'string' ? res.error : (res.error?.message || "Rejection failed"));
        }
        setProcessing(false);
    };

    const columns: Column<any>[] = [
        {
            header: "Customer",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium">{row.full_name}</div>
                        <div className="text-xs text-muted-foreground">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: "ID Type",
            cell: (row) => <span className="capitalize">{row.kyc_data?.id_type?.replace(/_/g, ' ')}</span>
        },
        {
            header: "ID Number",
            cell: (row) => <span className="font-mono text-xs">{row.kyc_data?.id_number}</span>
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={
                    row.kyc_status === 'verified' ? 'success' :
                        row.kyc_status === 'pending' ? 'warning' : 'destructive'
                }>
                    {row.kyc_status}
                </Badge>
            )
        },
        {
            header: "Submitted",
            cell: (row) => <span className="text-xs">{row.kyc_data?.submitted_at ? new Date(row.kyc_data.submitted_at).toLocaleDateString() : 'N/A'}</span>
        },
        {
            header: "Action",
            className: "text-right",
            cell: (row) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(row)}>
                    Review
                </Button>
            )
        }
    ];

    return (
        <>
            <SmartTable
                data={customers}
                columns={columns}
                searchKey="full_name"
                searchPlaceholder="Search customers..."
            />

            <Dialog open={!!selectedCustomer && !showRejectDialog} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Review KYC: {selectedCustomer?.full_name}</DialogTitle>
                        <DialogDescription>
                            Review the uploaded documents to verify the customer's identity.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">ID Card Photo</Label>
                            <div className="border rounded-lg overflow-hidden bg-muted group relative">
                                {selectedCustomer?.kyc_data?.id_url ? (
                                    <>
                                        <img src={selectedCustomer.kyc_data.id_url} className="w-full h-[250px] object-contain" alt="ID Document" />
                                        <a
                                            href={selectedCustomer.kyc_data.id_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </>
                                ) : (
                                    <div className="w-full h-[250px] flex items-center justify-center text-muted-foreground">No image</div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Selfie with ID</Label>
                            <div className="border rounded-lg overflow-hidden bg-muted group relative">
                                {selectedCustomer?.kyc_data?.selfie_url ? (
                                    <>
                                        <img src={selectedCustomer.kyc_data.selfie_url} className="w-full h-[250px] object-contain" alt="Selfie" />
                                        <a
                                            href={selectedCustomer.kyc_data.selfie_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </>
                                ) : (
                                    <div className="w-full h-[250px] flex items-center justify-center text-muted-foreground">No image</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm mt-4">
                        <div>
                            <span className="text-muted-foreground block">ID Type:</span>
                            <span className="font-semibold capitalize">{selectedCustomer?.kyc_data?.id_type?.replace(/_/g, ' ')}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">ID Number:</span>
                            <span className="font-semibold">{selectedCustomer?.kyc_data?.id_number}</span>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <div className="flex w-full justify-between gap-4">
                            <Button variant="ghost" onClick={() => setSelectedCustomer(null)} disabled={processing}>Cancel</Button>
                            <div className="flex gap-2">
                                <Button variant="outline" className="text-destructive border-destructive/20" onClick={() => setShowRejectDialog(true)} disabled={processing}>
                                    <X className="mr-2 h-4 w-4" /> Reject
                                </Button>
                                <Button className="bg-success hover:bg-success/90" onClick={() => handleVerify(selectedCustomer.id)} disabled={processing}>
                                    <Check className="mr-2 h-4 w-4" /> Verify Account
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject KYC</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this KYC submission. This will be shown to the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Rejection Reason</Label>
                        <Input
                            placeholder="e.g. ID card photo is blurry"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Back</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processing || !reason}>
                            {processing ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
