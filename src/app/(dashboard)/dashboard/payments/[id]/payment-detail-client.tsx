"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PaymentReversalDialog } from "@/components/payments/payment-reversal-dialog";
import {
    ArrowLeft,
    Download,
    RotateCcw,
    ExternalLink,
    FileText,
    CheckCircle2,
    Loader2,
    User,
    Building2,
    Calendar,
    CreditCard,
    Receipt,
    AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { isHalfPlot } from "@/lib/utils/plot";
import { toast } from "sonner";
import Link from "next/link";
import { reversePaymentAction, generateReceiptAction, getSignedReceiptUrlAction } from "@/lib/actions/payment-actions";

interface PaymentDetailClientProps {
    payment: any;
    userRole: string;
    userId: string;
}

export function PaymentDetailClient({ payment: initialPayment, userRole, userId }: PaymentDetailClientProps) {
    const router = useRouter();
    const [payment, setPayment] = useState(initialPayment);
    const [generatingReceipt, setGeneratingReceipt] = useState(false);
    const [reversalDialogOpen, setReversalDialogOpen] = useState(false);

    const canReverse = ['sysadmin', 'ceo', 'md'].includes(userRole);

    const handleDownloadReceipt = async () => {
        const path = payment.receipt_url || payment.receipt_path;
        if (!path) {
            toast.error("Receipt not available");
            return;
        }

        try {
            const result = await getSignedReceiptUrlAction({ path });
            if (result?.data) {
                window.open(result.data, '_blank');
            } else {
                throw new Error("Failed to get signed URL");
            }
        } catch (error) {
            console.error("Error downloading receipt:", error);
            toast.error("Failed to download receipt");
        }
    };

    const handleGenerateReceipt = async (regenerate = false) => {
        setGeneratingReceipt(true);
        try {
            const result = await generateReceiptAction({
                paymentId: payment.id,
                regenerate
            });

            if (result?.success) {
                toast.success(regenerate ? "Receipt regenerated successfully!" : "Receipt generated successfully!");
                const dataAny = result.data as any;
                if (dataAny?.signedUrl) {
                    window.open(dataAny.signedUrl, '_blank');
                }
                // Refresh local state if needed, or rely on revalidatePath
                router.refresh();
            } else {
                toast.error(typeof result?.error === 'string' ? result.error : "Failed to generate receipt");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
        } finally {
            setGeneratingReceipt(false);
        }
    };

    const outstandingBalance = (payment.allocation_total_price || 0) - (payment.allocation_amount_paid || 0);
    const isFullyPaid = outstandingBalance <= 0;

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'verified': return 'success';
            case 'reversed': return 'destructive';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-10 w-10 shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {formatCurrency(payment.amount)}
                            </h1>
                            <Badge variant={getStatusVariant(payment.status) as any} className="h-6">
                                {payment.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Payment to {payment.customer_name} • {new Date(payment.payment_date || payment.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:self-start">
                    {payment.receipt_url && (
                        <Button variant="outline" onClick={handleDownloadReceipt}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                        </Button>
                    )}
                    {!payment.receipt_url && payment.status !== 'reversed' && (
                        <Button
                            variant="outline"
                            onClick={() => handleGenerateReceipt(false)}
                            disabled={generatingReceipt}
                        >
                            {generatingReceipt ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Receipt className="mr-2 h-4 w-4" />
                            )}
                            Generate Receipt
                        </Button>
                    )}
                    {canReverse && payment.status !== 'reversed' && (
                        <Button
                            variant="destructive"
                            onClick={() => setReversalDialogOpen(true)}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reverse
                        </Button>
                    )}
                </div>
            </div>

            {/* Reversed Warning */}
            {payment.status === 'reversed' && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-red-900">This transaction has been reversed</p>
                        <p className="text-sm text-red-700">
                            {payment.reversal_reason || 'No reason provided'}
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="u-card">
                        <CardContent className="p-6">
                            <h2 className="text-sm font-semibold text-foreground mb-4">Transaction Details</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Reference</p>
                                    <p className="text-sm font-medium font-mono">
                                        {payment.transaction_ref || payment.reference || payment.id.slice(0, 8).toUpperCase()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Payment Method</p>
                                    <p className="text-sm font-medium capitalize">
                                        {payment.method || payment.payment_method || 'Not specified'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="text-sm font-medium">
                                        {new Date(payment.payment_date || payment.created_at).toLocaleDateString(undefined, {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <p className="text-sm font-medium capitalize">{payment.status}</p>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <h2 className="text-sm font-semibold text-foreground mb-4">Receipt Status</h2>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${payment.receipt_url
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-muted text-muted-foreground'
                                        }`}>
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {payment.receipt_url ? 'Receipt Available' : 'Receipt Pending'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.receipt_url
                                                ? 'Click download to get a copy'
                                                : 'Generate a receipt for this payment'}
                                        </p>
                                    </div>
                                </div>
                                {payment.receipt_url ? (
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleGenerateReceipt(true)}
                                            disabled={generatingReceipt}
                                        >
                                            {generatingReceipt ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                            )}
                                            Regenerate
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleGenerateReceipt(false)}
                                        disabled={generatingReceipt || payment.status === 'reversed'}
                                    >
                                        {generatingReceipt ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <FileText className="mr-2 h-4 w-4" />
                                        )}
                                        Generate
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="u-card">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                    <User className="h-5 w-5" />
                                </div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Customer</p>
                            </div>
                            <Link href={`/dashboard/customers/${payment.customer_id}`} className="group block">
                                <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                                    {payment.customer_name}
                                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{payment.customer_email}</p>
                        </CardContent>
                    </Card>

                    <Card className="u-card">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Property</p>
                            </div>
                            <Link href={`/dashboard/allocations/${payment.allocation_id}`} className="group block mb-4">
                                <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                                    {payment.estate_name}
                                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </p>
                                <p className="text-sm text-muted-foreground">Plot {payment.plot_number}</p>
                            </Link>

                            <Separator className="my-4" />
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Balance</span>
                                    {isFullyPaid ? (
                                        <div className="flex items-center gap-1.5 text-green-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="text-sm font-semibold">Paid in Full</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-semibold text-orange-600">
                                            {formatCurrency(outstandingBalance)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="u-card">
                        <CardContent className="p-6">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">Quick Actions</p>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`/dashboard/payments/new?customer_id=${payment.customer_id}`}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Record Another Payment
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PaymentReversalDialog
                open={reversalDialogOpen}
                onOpenChange={setReversalDialogOpen}
                payment={{
                    id: payment.id,
                    amount: payment.amount,
                    payment_date: payment.payment_date || payment.created_at,
                    customer_name: payment.customer_name,
                    allocation_id: payment.allocation_id
                }}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
