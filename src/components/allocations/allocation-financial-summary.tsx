"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface AllocationFinancialSummaryProps {
    totalPrice: number;
    amountPaid: number;
    status: string;
    nextDueDate?: string | null;
    nextDueAmount?: number | null;
    overdueInstallments?: number;
}

export function AllocationFinancialSummary({
    totalPrice,
    amountPaid,
    status,
    nextDueDate,
    nextDueAmount,
    overdueInstallments = 0
}: AllocationFinancialSummaryProps) {
    const balance = totalPrice - amountPaid;
    const paymentPercentage = totalPrice > 0 ? (amountPaid / totalPrice) * 100 : 0;

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Total Price */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Price</span>
                    <span className="text-2xl font-bold" data-testid="total-price">{formatCurrency(totalPrice)}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">{paymentPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={paymentPercentage} className="h-3" />
                </div>

                {/* Amount Paid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            Amount Paid
                        </div>
                        <div className="text-lg font-semibold text-green-600" data-testid="amount-paid">
                            {formatCurrency(amountPaid)}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <DollarSign className="h-3 w-3" />
                            Outstanding
                        </div>
                        <div className="text-lg font-semibold text-orange-600">
                            {formatCurrency(balance)}
                        </div>
                    </div>
                </div>

                {/* Next Payment Due */}
                {status === 'approved' && nextDueDate && nextDueAmount && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">Next Payment Due</div>
                                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    {formatCurrency(nextDueAmount)} due on {formatDate(nextDueDate)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overdue Alert */}
                {overdueInstallments > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-red-900 dark:text-red-100">Overdue Payments</div>
                                <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                    {overdueInstallments} installment{overdueInstallments !== 1 ? 's' : ''} overdue
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Badge - Removed for redundancy with header */}
            </CardContent>
        </Card>
    );
}
