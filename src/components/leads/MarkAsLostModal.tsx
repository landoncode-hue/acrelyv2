"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

interface MarkAsLostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: {
        id: string;
        full_name: string;
    };
    onSuccess?: () => void;
}

const LOST_REASONS = [
    { value: "price_too_high", label: "Price too high" },
    { value: "no_longer_interested", label: "No longer interested" },
    { value: "bought_elsewhere", label: "Bought elsewhere" },
    { value: "no_response", label: "No response" },
    { value: "not_ready", label: "Not ready to buy" },
    { value: "location_issue", label: "Location not suitable" },
    { value: "other", label: "Other" }
];

export function MarkAsLostModal({
    open,
    onOpenChange,
    lead,
    onSuccess
}: MarkAsLostModalProps) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const { profile } = useProfile();
    async function handleMarkAsLost() {
        if (!reason) {
            toast.error("Please select a reason");
            return;
        }

        setLoading(true);

        try {
            // Update lead status
            toast.error("Lead lost functionality disabled");
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to mark lead as lost");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenChange(newOpen: boolean) {
        if (!newOpen) {
            // Reset form when closing
            setReason("");
            setNotes("");
        }
        onOpenChange(newOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-destructive" />
                        Mark Lead as Lost
                    </DialogTitle>
                    <DialogDescription>
                        Mark <strong>{lead.full_name}</strong> as lost. This will remove the lead from your active queue.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Reason <span className="text-destructive">*</span>
                        </Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger id="reason">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {LOST_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">
                            {reason === 'other' ? 'Please specify' : 'Additional Notes (Optional)'}
                        </Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={
                                reason === 'other'
                                    ? "Please provide details..."
                                    : "Any additional context..."
                            }
                            className="min-h-[100px] resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleMarkAsLost}
                        disabled={loading || !reason || (reason === 'other' && !notes)}
                    >
                        {loading ? "Saving..." : "Mark as Lost"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
