"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Archive, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { archiveEstateAction } from "@/lib/actions/estate-actions";

interface ArchiveEstateModalProps {
    estateId: string;
    estateName: string;
    trigger?: React.ReactNode;
}

export function ArchiveEstateModal({
    estateId,
    estateName,
    trigger
}: ArchiveEstateModalProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const router = useRouter();

    const handleArchive = async () => {
        if (!reason.trim()) {
            toast.error("Please provide a reason for archiving");
            return;
        }

        setLoading(true);
        setValidationError(null);

        try {
            const result = await archiveEstateAction({
                id: estateId,
                reason: reason.trim()
            });

            if (result.success) {
                toast.success(`${estateName} has been archived`);
                setOpen(false);
                router.refresh(); // Or redirect if needed
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to archive estate";

                // If the error message likely comes from the validation check (RPC logic), we might want to show it as validation error
                if (errorMessage.includes("Active allocations") || errorMessage.includes("Cannot archive")) {
                    setValidationError(errorMessage);
                } else {
                    throw new Error(errorMessage);
                }
            }
        } catch (error: any) {
            console.error('Archive error:', error);
            toast.error(error.message || "Failed to archive estate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="destructive" size="sm">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Estate
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Archive Estate</DialogTitle>
                    <DialogDescription>
                        Archive <strong>{estateName}</strong>. This will hide it from allocation creation and mark it as inactive.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {validationError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{validationError}</AlertDescription>
                        </Alert>
                    )}

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Important:</strong> Archived estates cannot have new allocations created.
                            Existing allocations will remain intact.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Archiving *</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Project completed, Development cancelled, etc."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                            This reason will be logged in the audit trail
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleArchive}
                        disabled={loading || !reason.trim()}
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Archive Estate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
