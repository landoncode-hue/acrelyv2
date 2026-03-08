"use client";

import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Shield } from "lucide-react";
import { updateCustomerKYCAction } from "@/lib/actions/customer-actions";

interface KYCStatusManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: {
        id: string;
        full_name: string;
        kyc_status: string;
    };
    onUpdate?: (status: string) => void;
}

type KYCStatus = "not_started" | "pending" | "verified" | "rejected";

const KYC_STATUS_CONFIG: Record<KYCStatus, {
    label: string;
    icon: React.ReactNode;
    variant: "default" | "secondary" | "success" | "destructive";
    description: string;
}> = {
    not_started: {
        label: "Not Started",
        icon: <Shield className="h-4 w-4" />,
        variant: "secondary",
        description: "KYC verification has not been initiated"
    },
    pending: {
        label: "Pending",
        icon: <ShieldQuestion className="h-4 w-4" />,
        variant: "default",
        description: "KYC documents submitted, awaiting review"
    },
    verified: {
        label: "Verified",
        icon: <ShieldCheck className="h-4 w-4" />,
        variant: "success",
        description: "KYC verification completed successfully"
    },
    rejected: {
        label: "Rejected",
        icon: <ShieldAlert className="h-4 w-4" />,
        variant: "destructive",
        description: "KYC verification failed or rejected"
    }
};

export function KYCStatusManager({
    open,
    onOpenChange,
    customer,
    onUpdate
}: KYCStatusManagerProps) {
    const [status, setStatus] = useState<KYCStatus>(customer.kyc_status as KYCStatus);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    async function handleSubmit() {
        if (status === "rejected" && !notes.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setLoading(true);

        try {
            const result = await updateCustomerKYCAction({
                customerId: customer.id,
                status: status as any,
                notes: notes.trim()
            });

            if (!result.success) {
                const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || "Failed to update KYC status";
                throw new Error(errorMessage);
            }

            toast.success(`KYC status updated to ${KYC_STATUS_CONFIG[status].label}`);
            onOpenChange(false);
            onUpdate?.(status);
        } catch (error: any) {
            toast.error(error.message || "Failed to update KYC status");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        Update KYC Status
                    </DialogTitle>
                    <DialogDescription>
                        Update KYC verification status for <strong>{customer.full_name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Status */}
                    <div className="space-y-2">
                        <Label>Current Status</Label>
                        <div>
                            <Badge variant={KYC_STATUS_CONFIG[customer.kyc_status as KYCStatus]?.variant || "secondary"}>
                                {KYC_STATUS_CONFIG[customer.kyc_status as KYCStatus]?.label || customer.kyc_status}
                            </Badge>
                        </div>
                    </div>

                    {/* New Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">New Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as KYCStatus)}>
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(KYC_STATUS_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            {config.icon}
                                            <span>{config.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {KYC_STATUS_CONFIG[status].description}
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            Notes {status === "rejected" && <span className="text-destructive">*</span>}
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={
                                status === "rejected"
                                    ? "Required: Explain reason for rejection..."
                                    : "Optional: Add any relevant notes..."
                            }
                            rows={4}
                            className="resize-none"
                        />
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
                        onClick={handleSubmit}
                        disabled={loading || (status === "rejected" && !notes.trim())}
                    >
                        {loading ? "Updating..." : "Update Status"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Export KYC status badge component for reuse
export function KYCStatusBadge({ status }: { status: string }) {
    const config = KYC_STATUS_CONFIG[status as KYCStatus] || KYC_STATUS_CONFIG.not_started;

    return (
        <Badge variant={config.variant} className="gap-1">
            {config.icon}
            {config.label}
        </Badge>
    );
}
