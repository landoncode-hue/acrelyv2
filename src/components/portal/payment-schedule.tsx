"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Installment {
    id: string;
    installment_number: number;
    due_date: string;
    amount_due: number;
    status: 'pending' | 'paid' | 'overdue';
}

interface PaymentPlan {
    id: string;
    plan_type: string;
    total_amount: number;
    duration_months: number;
    status: string;
    allocation: {
        estates: { name: string };
        plots: { plot_number: string };
    };
    installments: Installment[];
}

interface PaymentScheduleProps {
    customerId: string;
}

export function PaymentSchedule({ customerId }: PaymentScheduleProps) {
    const [plans, setPlans] = useState<PaymentPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        setLoading(false);
    }, [customerId]);

    useEffect(() => {
        const init = async () => {
            await fetchPlans();
        };
        void init();
    }, [fetchPlans]);

    const getNextDueInstallment = (installments: Installment[]) => {
        const pending = installments
            .filter(i => i.status === 'pending' || i.status === 'overdue')
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        return pending[0];
    };

    const getPaidCount = (installments: Installment[]) => {
        return installments.filter(i => i.status === 'paid').length;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'overdue': return <AlertCircle className="h-4 w-4 text-red-600" />;
            default: return <Clock className="h-4 w-4 text-amber-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge variant="success">Paid</Badge>;
            case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
            default: return <Badge variant="secondary">Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (plans.length === 0) {
        return null; // Don't show section if no installment plans
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Schedules</h3>

            {plans.map(plan => {
                const nextDue = getNextDueInstallment(plan.installments);
                const paidCount = getPaidCount(plan.installments);
                const progress = (paidCount / plan.installments.length) * 100;
                const allocation = plan.allocation as any;

                return (
                    <Card key={plan.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">
                                        {allocation?.estates?.name || 'Property'}
                                    </CardTitle>
                                    <CardDescription>
                                        Plot #{allocation?.plots?.plot_number || 'N/A'} • {plan.plan_type.replace('_', ' ')} plan
                                    </CardDescription>
                                </div>
                                <Badge variant={plan.status === 'completed' ? 'success' : 'secondary'}>
                                    {plan.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Progress Overview */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">{paidCount} of {plan.installments.length} installments paid</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            {/* Next Due */}
                            {nextDue && (
                                <div className={`p-3 rounded-lg ${nextDue.status === 'overdue' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {nextDue.status === 'overdue' ? (
                                                <AlertCircle className="h-5 w-5 text-red-600" />
                                            ) : (
                                                <Calendar className="h-5 w-5 text-amber-600" />
                                            )}
                                            <div>
                                                <p className="font-medium">
                                                    {nextDue.status === 'overdue' ? 'Overdue Payment' : 'Next Payment Due'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(nextDue.due_date).toLocaleDateString('en-US', {
                                                        month: 'long', day: 'numeric', year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${nextDue.status === 'overdue' ? 'text-red-600' : 'text-amber-700'}`}>
                                                {formatCurrency(nextDue.amount_due)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Installment #{nextDue.installment_number}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Installments */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">All Installments</p>
                                <div className="divide-y rounded-lg border">
                                    {plan.installments
                                        .sort((a, b) => a.installment_number - b.installment_number)
                                        .map(inst => (
                                            <div key={inst.id} className="flex items-center justify-between p-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(inst.status)}
                                                    <div>
                                                        <span className="font-medium">Installment #{inst.installment_number}</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            Due: {new Date(inst.due_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{formatCurrency(inst.amount_due)}</span>
                                                    {getStatusBadge(inst.status)}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
