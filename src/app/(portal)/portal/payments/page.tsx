"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Download, CheckCircle2, Clock, AlertCircle, TrendingUp, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentSchedule } from "@/components/portal/payment-schedule";
import { MakePaymentDialog } from "@/components/portal/make-payment-dialog";

interface AllocationPlot {
    plot_id: string;
    plot_size: string;
    unit_price: number;
    plots: {
        plot_number: string;
    };
}

interface AllocationSummary {
    id: string;
    estate_name: string;
    plot_number: string;
    plot_numbers: string[]; // Array for multi-plot
    plot_count: number;
    total_price: number;
    amount_paid: number;
    outstanding_balance: number;
    status: string;
    payments: any[];
    next_due_date?: string;
    next_due_amount?: number;
}

export default function MyPaymentsPage() {
    const [allocations, setAllocations] = useState<AllocationSummary[]>([]);
    const [allPayments, setAllPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_paid: 0,
        total_outstanding: 0,
        properties_count: 0,
        last_payment_date: null as string | null
    });
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);


    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);



        setLoading(false);
    }

    const handleDownloadReceipt = async (payment: any) => {
        if (!payment.receipt_path) {
            toast.error("Receipt not available");
            return;
        }

        try {
            toast.error("Download disabled");
        } catch (error) {
            console.error("Error downloading receipt:", error);
            toast.error("Failed to download receipt");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading your payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">My Payments</h2>
                    <p className="text-muted-foreground">Track your payment history and property progress</p>
                </div>
                <Button onClick={() => setShowPaymentDialog(true)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Make Payment
                </Button>
            </div>

            {/* Make Payment Dialog */}
            <MakePaymentDialog
                open={showPaymentDialog}
                onOpenChange={setShowPaymentDialog}
                allocations={allocations.map(a => ({
                    id: a.id,
                    estate_name: a.estate_name,
                    plot_number: a.plot_number,
                    outstanding_balance: a.outstanding_balance
                }))}
                customerId={customerId || ''}
                onPaymentComplete={() => fetchData()}
            />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Total Paid</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(stats.total_paid)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <AlertCircle className="h-4 w-4" />
                            <span>Outstanding</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(stats.total_outstanding)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-muted-foreground text-sm mb-1">Properties</div>
                        <div className="text-2xl font-bold">{stats.properties_count}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                            <Clock className="h-4 w-4" />
                            <span>Last Payment</span>
                        </div>
                        <div className="text-sm font-medium">
                            {stats.last_payment_date
                                ? new Date(stats.last_payment_date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })
                                : 'No payments yet'
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Properties Progress */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Payment Progress</h3>

                {allocations.map((allocation) => {
                    const progress = allocation.total_price > 0
                        ? (allocation.amount_paid / allocation.total_price) * 100
                        : 0;
                    const isFullyPaid = allocation.outstanding_balance <= 0;

                    return (
                        <Card key={allocation.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            {allocation.estate_name}
                                            {allocation.plot_count > 1 && (
                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                    {allocation.plot_count} Plots
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {allocation.plot_count > 1
                                                ? `Plots: ${allocation.plot_numbers.map(p => `#${p}`).join(', ')}`
                                                : `Plot #${allocation.plot_number}`
                                            }
                                        </p>
                                    </div>
                                    <Badge variant={isFullyPaid ? 'default' : 'secondary'}>
                                        {allocation.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Payment Progress</span>
                                        <span className="font-medium">{progress.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>

                                {/* Financial Summary */}
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Total Price</div>
                                        <div className="font-semibold">{formatCurrency(allocation.total_price)}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Paid</div>
                                        <div className="font-semibold text-green-600">
                                            {formatCurrency(allocation.amount_paid)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Outstanding</div>
                                        <div className="font-semibold text-orange-600">
                                            {formatCurrency(allocation.outstanding_balance)}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Payments */}
                                {allocation.payments.length > 0 && (
                                    <>
                                        <Separator />
                                        <div>
                                            <div className="text-sm font-medium mb-2">Recent Payments</div>
                                            <div className="space-y-2">
                                                {allocation.payments.slice(0, 3).map((payment: any) => (
                                                    <div key={payment.id} className="flex items-center justify-between text-sm bg-zinc-50 rounded-lg p-2">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                            <span className="text-muted-foreground">
                                                                {new Date(payment.payment_date).toLocaleDateString()}
                                                            </span>
                                                            <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                                        </div>
                                                        {payment.receipt_status === 'generated' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDownloadReceipt(payment)}
                                                            >
                                                                <Download className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {allocations.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No properties found. Contact our office to get started.
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Payment Schedules (for installment plans) */}
            {customerId && <PaymentSchedule customerId={customerId} />}

            {/* Payment Timeline */}
            {allPayments.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Timeline</h3>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {allPayments.map((payment, index) => (
                                    <div key={payment.id}>
                                        <div className="flex gap-4">
                                            {/* Timeline Indicator */}
                                            <div className="flex flex-col items-center">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${payment.status === 'verified' ? 'bg-green-100' : 'bg-zinc-100'
                                                    }`}>
                                                    <CheckCircle2 className={`h-4 w-4 ${payment.status === 'verified' ? 'text-green-600' : 'text-zinc-400'
                                                        }`} />
                                                </div>
                                                {index < allPayments.length - 1 && (
                                                    <div className="w-0.5 h-full bg-zinc-200 flex-1 min-h-[40px]" />
                                                )}
                                            </div>

                                            {/* Payment Details */}
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="font-medium">
                                                            {formatCurrency(payment.amount)}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {payment.estate_name} - Plot {payment.plot_number}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(payment.payment_date).toLocaleDateString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs capitalize">
                                                                {payment.method?.replace('_', ' ')}
                                                            </Badge>
                                                            {payment.reference && (
                                                                <span className="text-xs font-mono text-muted-foreground">
                                                                    {payment.reference}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {payment.receipt_status === 'generated' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDownloadReceipt(payment)}
                                                        >
                                                            <Download className="h-4 w-4 mr-2" />
                                                            Receipt
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
