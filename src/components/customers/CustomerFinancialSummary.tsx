"use client";

import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Home, Landmark, Coins, TrendingUp, AlertTriangle, DollarSign, AlertCircle, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CustomerFinancialSummaryProps {
    customerId: string;
}

interface FinancialSummary {
    total_investment: number;
    total_paid: number;
    outstanding_balance: number;
    total_properties: number;
    next_payment_due: string | null;
}

export function CustomerFinancialSummary({ customerId }: CustomerFinancialSummaryProps) {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchSummary = useCallback(async () => {
        setLoading(false);
    }, [customerId]);

    useEffect(() => {
        const init = async () => {
            await fetchSummary();
        };
        void init();
    }, [fetchSummary]);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!summary) return null;

    const paymentProgress = summary.total_investment > 0
        ? (summary.total_paid / summary.total_investment) * 100
        : 0;

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {/* Total Investment */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        ₦{summary.total_investment.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {summary.total_properties} {summary.total_properties === 1 ? "property" : "properties"}
                    </p>
                </CardContent>
            </Card>

            {/* Total Paid */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        ₦{summary.total_paid.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {paymentProgress.toFixed(1)}% complete
                    </p>
                </CardContent>
            </Card>

            {/* Outstanding Balance */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                        ₦{summary.outstanding_balance.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Remaining to pay
                    </p>
                </CardContent>
            </Card>

            {/* Next Payment Due */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Payment Due</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {summary.next_payment_due ? (
                        <>
                            <div className="text-2xl font-bold">
                                {new Date(summary.next_payment_due).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {new Date(summary.next_payment_due).toLocaleDateString()}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold text-muted-foreground">—</div>
                            <p className="text-xs text-muted-foreground">No pending payments</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
