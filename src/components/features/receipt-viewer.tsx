"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ReceiptViewerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: any; // Using any for now, should be Payment type
}

export function ReceiptViewer({ open, onOpenChange, payment }: ReceiptViewerProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    if (!payment) return null;

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            toast.error("Receipt not found. It may not have been generated yet.");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download receipt");
        } finally {
            setIsDownloading(false);
        }
    };

    // Get receipt number from payment if available
    const receiptNumber = payment.receipt_number || payment.receipts?.receipt_number;
    const receiptStatus = payment.receipt_status || "pending";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[600px] p-0 overflow-hidden bg-white">
                <div className="p-6 md:p-8 space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-brand-orange">
                                Pinnacle Builders
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">Do Real Estate, The Pinnacle Way</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">Receipt</h3>
                            {receiptNumber ? (
                                <p className="font-mono text-sm mt-1">{receiptNumber}</p>
                            ) : (
                                <Badge variant="outline" className="mt-1">
                                    {receiptStatus === "pending" ? "Generating..." : "Not Generated"}
                                </Badge>
                            )}
                            <p className="text-sm text-muted-foreground">{new Date(payment.payment_date || payment.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <div className="flex justify-between">
                            <div className="space-y-1">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Received From</p>
                                <p className="font-medium">{payment.allocation?.customers?.full_name || payment.customers?.full_name || "Valued Customer"}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">Allocated For</p>
                                <p className="font-medium">Plot {payment.allocation?.plots?.plot_number || payment.plots?.plot_number || "Unknown"}</p>
                                <p className="text-sm text-muted-foreground">{payment.allocation?.estates?.name || payment.estates?.name}</p>
                            </div>
                        </div>

                        <div className="bg-muted/10 p-4 rounded-lg border border-dashed flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Amount Paid</span>
                            <span className="text-2xl font-bold tracking-tight">{formatCurrency(payment.amount)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Payment Method</span>
                                <span className="capitalize">{payment.method?.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Reference</span>
                                <span className="font-mono">{payment.transaction_ref || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t flex items-center justify-between text-muted-foreground text-xs">
                        <p>Thank you for your business.</p>
                        <p>Powered by Acrely®</p>
                    </div>
                </div>

                <div className="bg-muted p-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleDownload}
                        disabled={isDownloading || receiptStatus !== "generated"}
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
