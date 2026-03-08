"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getSignedReceiptUrlAction } from "@/lib/actions/payment-actions";

interface ReceiptDownloadButtonProps {
    paymentId: string;
    receiptNumber?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showIcon?: boolean;
}

export function ReceiptDownloadButton({
    paymentId,
    receiptNumber,
    variant = "default",
    size = "default",
    className,
    showIcon = true,
}: ReceiptDownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const handleDownload = async () => {
        try {
            setIsLoading(true);

            // Construct expected path
            const expectedPath = `${paymentId}/receipt-${receiptNumber || paymentId}.pdf`;
            const result = await getSignedReceiptUrlAction({ path: expectedPath });

            if (result?.success && result?.data) {
                // Open presigned URL in new tab to trigger download
                window.open(result.data, '_blank');
                toast.success("Receipt downloaded successfully");
            } else {
                toast.error(typeof result?.error === 'string' ? result.error : result?.error?.message || "Receipt not found or not generated yet.");
            }
        } catch (error) {
            console.error("Receipt download error:", error);
            toast.error("Failed to download receipt. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleDownload}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className={showIcon && size !== "icon" ? "mr-2 h-4 w-4 animate-spin" : "h-4 w-4 animate-spin"} />
                    {size !== "icon" && "Loading..."}
                </>
            ) : (
                <>
                    {showIcon && <Download className={size !== "icon" ? "mr-2 h-4 w-4" : "h-4 w-4"} />}
                    {size !== "icon" && (receiptNumber ? `Download ${receiptNumber}` : "Download Receipt")}
                </>
            )}
        </Button>
    );
}
