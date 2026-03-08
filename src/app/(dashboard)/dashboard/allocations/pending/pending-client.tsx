"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, User, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { approveAllocationAction, rejectAllocationAction } from "@/lib/actions/allocation-actions";

interface PendingAllocation {
    allocation_id: string;
    customer_name: string;
    customer_phone: string;
    estate_name: string;
    plot_number: string | null;
    total_price: number;
    payment_plan: string;
    agent_name: string | null;
    drafted_by_name: string | null;
    created_at: string;
    days_pending: number;
}

interface PendingClientProps {
    initialAllocations: PendingAllocation[];
}

export default function PendingClient({ initialAllocations }: PendingClientProps) {
    const [allocations, setAllocations] = useState<PendingAllocation[]>(initialAllocations);
    const [processing, setProcessing] = useState<string | null>(null);
    const router = useRouter();

    async function handleApprove(allocationId: string, plotId: string | null) {
        setProcessing(allocationId);
        try {
            const result = await approveAllocationAction({
                allocationId,
                plotId
            });

            if (result?.error) throw new Error(typeof result.error === "string" ? result.error : (result.error as any).message || "Action failed");

            toast.success('Allocation approved successfully');
            setAllocations(prev => prev.filter(a => a.allocation_id !== allocationId));
        } catch (error: any) {
            console.error('Error approving allocation:', error);
            toast.error(error.message || "Failed to update status");
        } finally {
            setProcessing(null);
        }
    }

    async function handleReject(allocationId: string) {
        setProcessing(allocationId);
        try {
            const result = await rejectAllocationAction({ allocationId });

            if (result?.error) throw new Error(typeof result.error === "string" ? result.error : (result.error as any).message || "Action failed");

            toast.success('Allocation rejected');
            setAllocations(prev => prev.filter(a => a.allocation_id !== allocationId));
        } catch (error: any) {
            console.error('Error rejecting allocation:', error);
            toast.error(error.message || "Failed to delete allocation");
        } finally {
            setProcessing(null);
        }
    }

    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    }

    function formatPaymentPlan(plan: string) {
        const plans: Record<string, string> = {
            'outright': 'Outright',
            '3_months': '3 Months',
            '6_months': '6 Months',
            '12_months': '12 Months'
        };
        return plans[plan] || plan;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Breadcrumbs />
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Pending Approvals"
                    description={`${allocations.length} allocation${allocations.length !== 1 ? 's' : ''} awaiting approval`}
                />
            </div>

            {allocations.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No pending approvals</p>
                        <p className="text-sm text-muted-foreground">All allocations have been processed</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {allocations.map((allocation) => (
                        <Card key={allocation.allocation_id} data-allocation-id={allocation.allocation_id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            {allocation.customer_name}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {allocation.estate_name} - Plot {allocation.plot_number || 'Unassigned'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                {formatCurrency(allocation.total_price)}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant={allocation.days_pending > 3 ? "destructive" : "secondary"}>
                                        <Clock className="h-3 w-3 mr-1" />
                                        {allocation.days_pending} day{allocation.days_pending !== 1 ? 's' : ''} pending
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Payment Plan</p>
                                        <p className="font-medium">{formatPaymentPlan(allocation.payment_plan)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p className="font-medium">{allocation.customer_phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Agent</p>
                                        <p className="font-medium">{allocation.agent_name || 'Direct'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Drafted By</p>
                                        <p className="font-medium">{allocation.drafted_by_name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => router.push(`/dashboard/allocations/${allocation.allocation_id}`)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        onClick={() => handleApprove(allocation.allocation_id, allocation.plot_number)}
                                        disabled={processing === allocation.allocation_id}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        data-testid="approve-button"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                        {processing === allocation.allocation_id ? 'Approving...' : 'Approve'}
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                disabled={processing === allocation.allocation_id}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Reject this allocation?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. The allocation for {allocation.customer_name} will be rejected.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleReject(allocation.allocation_id)}>
                                                    Confirm Rejection
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
