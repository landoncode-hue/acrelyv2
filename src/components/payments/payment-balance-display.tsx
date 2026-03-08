"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface PaymentBalanceDisplayProps {
    totalPrice: number;
    totalPaid: number;
    outstandingBalance: number;
    nextDueDate?: string;
    nextDueAmount?: number;
    overdueInstallments?: number;
    className?: string;
}

export function PaymentBalanceDisplay({
    totalPrice,
    totalPaid,
    outstandingBalance,
    nextDueDate,
    nextDueAmount,
    overdueInstallments = 0,
    className
}: PaymentBalanceDisplayProps) {
    const paymentPercentage = totalPrice > 0 ? (totalPaid / totalPrice) * 100 : 0;
    const isFullyPaid = outstandingBalance <= 0;
    const hasOverdue = overdueInstallments > 0;

    return (
        <Card className={className}>
            <CardContent className="pt-6 space-y-6">
                {/* Payment Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span className="font-medium">{paymentPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={paymentPercentage} className="h-2" />
                </div>

                {/* Financial Summary */}
                <div className="grid gap-4">
                    {/* Total Price */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Price</span>
                        <span className="text-sm font-medium">{formatCurrency(totalPrice)}</span>
                    </div>

                    {/* Total Paid */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Paid</span>
                        <span className="text-sm font-medium text-green-600">
                            {formatCurrency(totalPaid)}
                        </span>
                    </div>

                    {/* Outstanding Balance */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-semibold">Outstanding Balance</span>
                        <span className={`text-lg font-bold ${isFullyPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {formatCurrency(outstandingBalance)}
                        </span>
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-3 pt-2 border-t">
                    {/* Fully Paid Status */}
                    {isFullyPaid && (
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">Fully Paid</span>
                        </div>
                    )}

                    {/* Overdue Warning */}
                    {hasOverdue && (
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {overdueInstallments} Overdue Installment{overdueInstallments > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {/* Next Due */}
                    {!isFullyPaid && nextDueDate && nextDueAmount && (
                        <div className="bg-zinc-50 border rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs font-medium">Next Payment Due</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">
                                    {new Date(nextDueDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className="text-sm font-bold text-orange-600">
                                    {formatCurrency(nextDueAmount)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
