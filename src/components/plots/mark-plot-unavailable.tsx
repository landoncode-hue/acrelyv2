"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Ban } from "lucide-react";

interface MarkPlotUnavailableProps {
    plotId: string;
    plotNumber: string;
    onSuccess?: () => void;
}

export function MarkPlotUnavailable({ plotId, plotNumber, onSuccess }: MarkPlotUnavailableProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason");
            return;
        }

        setLoading(true);
        try {
            toast.error("Marking plot unavailable disabled");
        } catch (error: any) {
            toast.error(error.message || "Failed to mark plot unavailable");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setOpen(true)}
                className="gap-2"
            >
                <Ban className="h-4 w-4" />
                Mark Unavailable
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Plot {plotNumber} Unavailable</DialogTitle>
                        <DialogDescription>
                            This plot will be hidden from allocation and marked as unavailable.
                            Please provide a reason.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason *</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Land dispute, Legal hold, Construction issue"
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSubmit}
                            disabled={loading || !reason.trim()}
                        >
                            {loading ? "Processing..." : "Mark Unavailable"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
