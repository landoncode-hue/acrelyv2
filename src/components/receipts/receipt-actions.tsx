"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface ReceiptActionsProps {
    paymentId: string;
    receiptNumber?: string;
    receiptStatus?: "pending" | "generated" | "failed";
    customerEmail?: string;
    userRole?: string;
}

export function ReceiptActions({
    paymentId,
    receiptNumber,
    receiptStatus = "pending",
    customerEmail,
    userRole,
}: ReceiptActionsProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const canRegenerate = ["sysadmin", "ceo", "md"].includes(userRole || "");

    const handleDownload = async () => {
        toast.error("Receipt downloads temporarily disabled");
    };

    const handleRegenerate = async () => {
        toast.error("Receipt regeneration temporarily disabled");
    };

    const handleResendEmail = async () => {
        toast.error("Email resending temporarily disabled");
    };

    return (
        <div className="flex items-center gap-2">
            {/* Receipt Status Badge */}
            {receiptStatus === "pending" && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    Pending
                </Badge>
            )}
            {receiptStatus === "failed" && (
                <Badge variant="destructive">Failed</Badge>
            )}
            {receiptStatus === "generated" && receiptNumber && (
                <Badge variant="secondary" className="font-mono">
                    {receiptNumber}
                </Badge>
            )}

            {/* Download Button */}
            {receiptStatus === "generated" && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    Download
                </Button>
            )}

            {/* Regenerate Button (with confirmation) */}
            {receiptStatus === "generated" && canRegenerate && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isRegenerating}>
                            {isRegenerating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Regenerate
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Regenerate Receipt?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will regenerate the receipt PDF with the same receipt number ({receiptNumber}).
                                The content will remain identical. This action is logged for audit purposes.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRegenerate}>
                                Regenerate
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Resend Email Button */}
            {receiptStatus === "generated" && customerEmail && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResendEmail}
                    disabled={isResending}
                >
                    {isResending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Mail className="mr-2 h-4 w-4" />
                    )}
                    Resend Email
                </Button>
            )}
        </div>
    );
}
