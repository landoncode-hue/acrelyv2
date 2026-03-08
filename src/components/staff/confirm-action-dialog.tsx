"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface ConfirmActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    actionLabel: string;
    actionVariant?: "default" | "destructive";
    requireReason?: boolean;
    onConfirm: (reason?: string) => void | Promise<void>;
    loading?: boolean;
}

export function ConfirmActionDialog({
    open,
    onOpenChange,
    title,
    description,
    actionLabel,
    actionVariant = "default",
    requireReason = false,
    onConfirm,
    loading = false,
}: ConfirmActionDialogProps) {
    const [reason, setReason] = useState("");

    const handleConfirm = async () => {
        if (requireReason && !reason.trim()) {
            return;
        }
        await onConfirm(reason);
        setReason("");
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                {requireReason && (
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason *</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for this action..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground">
                            This will be logged in the staff history
                        </p>
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading || (requireReason && !reason.trim())}
                        className={actionVariant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                    >
                        {loading ? "Processing..." : actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
