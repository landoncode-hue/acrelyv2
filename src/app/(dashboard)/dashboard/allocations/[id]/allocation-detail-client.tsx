"use client";

import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Grid3X3, RotateCcw, AlertTriangle, XCircle, CheckCircle2, History, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AllocationFinancialSummary } from "@/components/allocations/allocation-financial-summary";
import { PaymentModal } from "@/components/features/payment-modal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { PlotGrid } from "@/components/features/plot-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { approveAllocationAction, assignPlotAction, reassignAllocationAction, cancelAllocationAction, completeAllocationAction } from "@/lib/actions/allocation-actions";
import { getEstatePlotsAction } from "@/lib/actions/estate-actions";

interface AllocationDetailClientProps {
    allocation: any;
    initialAvailablePlots: any[]; // initial fetch from server
}

export function AllocationDetailClient({ allocation, initialAvailablePlots }: AllocationDetailClientProps) {
    const [processing, setProcessing] = useState(false);
    const { profile } = useProfile();
    const router = useRouter();

    const [assignPlotId, setAssignPlotId] = useState("");
    const [assignSuffix, setAssignSuffix] = useState<string | undefined>();
    const [availablePlots, setAvailablePlots] = useState<any[]>(initialAvailablePlots || []);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [showPlotGrid, setShowPlotGrid] = useState(false);

    // Re-Assign State
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [newPlotId, setNewPlotId] = useState("");
    const [reassignReason, setReassignReason] = useState("");
    const [confirmReassign, setConfirmReassign] = useState(false);

    // Cancel State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Load initial assignPlotId
    useEffect(() => {
        if (allocation.plot_id) setAssignPlotId(allocation.plot_id);
    }, [allocation.plot_id]);

    // Refresh Plots if needed (e.g. real-time updates) - Optional, can rely on initialAvailablePlots if fast enough.
    // For now we rely on server passed props for availablePlots to avoid client fetch.

    // BUT we need to support refreshing if user changes estate? Allocation estate is fixed usually.
    // If we want real-time availability we might want to keep the client fetch or subscription.
    // Keeping client fetch for availability to ensure fresh status when opening grid.
    useEffect(() => {
        if (allocation.estate_id && showPlotGrid) {
            getEstatePlotsAction({ estateId: allocation.estate_id })
                .then((result) => {
                    if (result.success && result.data?.plots) {
                        const sorted = (result.data.plots as any[]).sort((a: any, b: any) =>
                            a.plot_number.localeCompare(b.plot_number, undefined, { numeric: true })
                        );
                        setAvailablePlots(sorted);
                    }
                })
                .catch(err => {
                    logger.error("Failed to fetch available plots", { error: err });
                });
        }
    }, [allocation.estate_id, showPlotGrid]);


    const handleApprove = async () => {
        if (!allocation.plot_id && !assignPlotId) {
            toast.error("Please assign a plot before approving.");
            return;
        }

        setProcessing(true);
        try {
            // First Assign Plot if not already assigned in DB
            if (!allocation.plot_id && assignPlotId) {
                const assignResult = await assignPlotAction({
                    allocationId: allocation.id,
                    plotId: assignPlotId,
                    assignSuffix: assignSuffix
                });
                if (!assignResult.success) {
                    throw new Error(typeof assignResult.error === 'string' ? assignResult.error : assignResult.error?.message);
                }
            }

            // Then Approve
            const result = await approveAllocationAction({ allocationId: allocation.id });
            if (!result.success) {
                throw new Error(typeof result.error === 'string' ? result.error : result.error?.message);
            }

            toast.success("Allocation Approved");
            // router.refresh(); // Handled by action?
        } catch (e: any) {
            toast.error(e.message || "Approval failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleReassign = async () => {
        if (!newPlotId) return toast.error("Please select a new plot");
        if (!reassignReason) return toast.error("Please provide a reason");
        if (!confirmReassign) return toast.error("Please confirm this action");

        setProcessing(true);
        try {
            const result = await reassignAllocationAction({
                allocationId: allocation.id,
                newPlotId: newPlotId,
                reason: reassignReason
            });

            if (!result.success) {
                throw new Error(typeof result.error === 'string' ? result.error : result.error?.message);
            }

            toast.success("Plot successfully re-assigned");
            setIsReassignModalOpen(false);
        } catch (e: any) {
            toast.error(e.message || "Re-assignment failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelReason) return toast.error("Please provide a reason");
        if (!confirmCancel) return toast.error("Please confirm this action");

        setProcessing(true);
        try {
            const result = await cancelAllocationAction({
                allocationId: allocation.id,
                reason: cancelReason
            });

            if (!result.success) {
                throw new Error(typeof result.error === 'string' ? result.error : result.error?.message);
            }

            toast.success("Allocation cancelled successfully");
            setIsCancelModalOpen(false);
        } catch (e: any) {
            toast.error(e.message || "Cancellation failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleComplete = async () => {
        setProcessing(true);
        try {
            const result = await completeAllocationAction({ allocationId: allocation.id });
            if (!result.success) {
                throw new Error(typeof result.error === 'string' ? result.error : result.error?.message);
            }

            toast.success("Allocation marked as completed");
        } catch (e: any) {
            toast.error(e.message || "Completion failed");
        } finally {
            setProcessing(false);
        }
    };

    const lastReassignment = allocation.allocation_reassignments?.[0];

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/allocations"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div className="flex-1 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Allocation Details</h1>
                            <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] uppercase text-zinc-600 dark:text-zinc-400 mt-1">
                                #{allocation.id.slice(0, 8)}
                            </span>
                            <Badge variant={
                                allocation.status === 'completed' ? 'default' :
                                    allocation.status === 'approved' ? 'secondary' :
                                        allocation.status === 'cancelled' ? 'destructive' :
                                            'outline'
                            } className="mt-1 h-5 px-1.5 py-0 text-[10px]" data-testid="allocation-status">
                                {allocation.status}
                            </Badge>
                        </div>
                        {lastReassignment && (
                            <div className="text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded inline-flex items-center mt-1 border border-orange-200 dark:border-orange-500/20">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Re-assigned on {format(new Date(lastReassignment.changed_at), 'MMM d')} by {lastReassignment.profiles?.full_name || 'Admin'}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Action Buttons Grouped */}
                        <Button onClick={() => setIsPaymentModalOpen(true)} size="sm" data-testid="record-payment-button">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Record Payment
                        </Button>

                        {['sysadmin', 'ceo', 'md'].includes(profile?.role || '') && allocation.plot_id && (
                            <Dialog open={isReassignModalOpen} onOpenChange={setIsReassignModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-orange-200 dark:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-orange-700 dark:text-orange-400">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Re-Assign
                                    </Button>
                                </DialogTrigger>
                                {/* ... Reassign Dialog Content ... */}
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-destructive">
                                            <AlertTriangle className="w-5 h-5" /> Re-Assign Allocated Plot
                                        </DialogTitle>
                                        <DialogDescription>
                                            This action allows you to move this allocation to a different plot.
                                            The current plot will be released and the new plot will be taken.
                                            History will be preserved.
                                            ## Visual Verification
                                            I have applied semantic classes that automatically follow the system's color scheme. The components now feel premium and integrated in both light and dark themes.

                                            ---

                                            # Debugging: Payment Records Not Showing

                                            I investigated the issue where payment records were not appearing on the dashboard (stuck in a loading state with skeleton loaders).

                                            ## Findings
                                            - **Infinite Fetch Loop**: The `PaymentsPage` had a `useEffect` that triggered whenever the `fetchPayments` function changed. Since `fetchPayments` was defined as a standard function inside the component, it was recreated on every render, causing an infinite loop.
                                            - **UI Inconsistency**: The `SmartTable` showed "Showing 0 records" while the `loading` flag was still true, which could be confusing to users.

                                            ## Fixes Applied

                                            ### 1. Payments Dashboard
                                            - **Memoization**: Wrapped `fetchPayments` in `useMemo` (and updated the dependency array of `useEffect`) to ensure the function reference remains stable, breaking the infinite loop.
                                            - **Error Handling**: Added `try...catch...finally` blocks with `sonner` toasts and console logging to provide better feedback if a database query fails.

                                            ### 2. Smart Table
                                            - **Loading UI**: Updated the toolbar to hide the record count when `loading` is active. This ensures the user sees the skeleton loaders without the "0 records" label until the data has actually been fetched.

                                            ## Verification
                                            The infinite loop is now resolved, and the component will correctly transition from a skeleton loading state to either a list of records or a proper "No records found" state.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Current Plot</Label>
                                                <div className="p-3 bg-muted rounded-md font-mono text-sm">
                                                    {allocation.plots?.plot_number}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>New Plot</Label>
                                                {newPlotId ? (
                                                    <div className="flex justify-between items-center p-3 border rounded-md bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30">
                                                        <span className="font-bold text-green-700 dark:text-green-400">
                                                            {availablePlots.find(p => p.id === newPlotId)?.plot_number}
                                                        </span>
                                                        <Button variant="ghost" size="sm" onClick={() => setNewPlotId("")} className="h-6">Change</Button>
                                                    </div>
                                                ) : (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" className="w-full justify-between">
                                                                Select New Plot <Grid3X3 className="w-4 h-4 ml-2" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                            <PlotGrid
                                                                plots={availablePlots}
                                                                estateId={allocation.estate_id}
                                                                onSelect={(p) => {
                                                                    setNewPlotId(p.id);
                                                                    // Close inner dialog logic handled effectively by just clicking
                                                                }}
                                                            />
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Reason for Re-Assignment <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                placeholder="Please explain why this plot is being changed..."
                                                value={reassignReason}
                                                onChange={e => setReassignReason(e.target.value)}
                                            />
                                        </div>

                                        {allocation.payments?.length > 0 && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-md">
                                                <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-1">Financial Impact</h4>
                                                <p className="text-xs text-blue-700 dark:text-blue-400">
                                                    This customer has made {allocation.payments.length} payments totaling
                                                    ₦{allocation.payment_plans?.[0]?.payment_plan_installments?.filter((i: any) => i.status === 'paid').reduce((acc: number, c: any) => acc + c.amount_paid, 0).toLocaleString()}.
                                                    These payments will be transferred to the new plot automatically.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox
                                                id="confirm"
                                                checked={confirmReassign}
                                                onCheckedChange={(c) => setConfirmReassign(c as boolean)}
                                            />
                                            <label
                                                htmlFor="confirm"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                I understand this action is irreversible and will be logged.
                                            </label>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsReassignModalOpen(false)}>Cancel</Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleReassign}
                                            disabled={!newPlotId || !reassignReason || !confirmReassign || processing}
                                        >
                                            {processing ? "Processing..." : "Confirm Re-Assignment"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Cancel Allocation (CEO/SysAdmin only) */}
                        {['sysadmin', 'ceo', 'md'].includes(profile?.role || '') && allocation.status !== 'cancelled' && allocation.status !== 'completed' && (
                            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel Allocation
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-destructive">
                                            <AlertTriangle className="w-5 h-5" /> Cancel Allocation
                                        </DialogTitle>
                                        <DialogDescription>
                                            This action will cancel the allocation and release the plot. This should only be done in exceptional circumstances.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Reason for Cancellation <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                placeholder="Please explain why this allocation is being cancelled..."
                                                value={cancelReason}
                                                onChange={e => setCancelReason(e.target.value)}
                                            />
                                        </div>

                                        {allocation.payments?.length > 0 && (
                                            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-md">
                                                <h4 className="font-medium text-red-800 dark:text-red-300 text-sm mb-1">Payment Warning</h4>
                                                <p className="text-xs text-red-700 dark:text-red-400">
                                                    This allocation has {allocation.payments.length} payment(s). Cancellation may require refund processing.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox
                                                id="confirm-cancel"
                                                checked={confirmCancel}
                                                onCheckedChange={(c) => setConfirmCancel(c as boolean)}
                                            />
                                            <label
                                                htmlFor="confirm-cancel"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                I understand this action will be logged and audited.
                                            </label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Cancel</Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleCancel}
                                            disabled={!cancelReason || !confirmCancel || processing}
                                        >
                                            {processing ? "Processing..." : "Confirm Cancellation"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Complete Allocation (Staff only, if fully paid) */}
                        {allocation.status === 'approved' && allocation.amount_paid >= allocation.total_price && (
                            <Button
                                onClick={handleComplete}
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {processing ? "Processing..." : "Mark as Completed"}
                            </Button>
                        )}
                    </div>
                </div>
            </div >

            <div className="grid gap-6">
                <Card>
                    <CardHeader className="pb-3 border-b bg-zinc-50/50 dark:bg-zinc-900/50">
                        <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Entity Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-zinc-100 dark:divide-zinc-800">
                        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
                            {/* Customer Column */}
                            <div className="p-6 space-y-4">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" />
                                    Customer Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground block mb-1">Full Name</label>
                                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{allocation.customers?.full_name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">Email</label>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{allocation.customers?.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">Phone</label>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{allocation.customers?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Property Column */}
                            <div className="p-6 space-y-4">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-orange-500" />
                                    Property Selection
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">Estate</label>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{allocation.estates?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-xs text-muted-foreground block mb-1">Plot Number</label>
                                            <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                                {allocation.plots?.plot_number || "UNASSIGNED"}
                                                {allocation.plots?.status && (
                                                    <span data-testid="plot-status" className="ml-2 text-[10px] uppercase font-normal text-muted-foreground">
                                                        ({allocation.plots.status})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-50 dark:border-zinc-900">
                                        <div>
                                            <label className="text-xs text-muted-foreground block mb-1">Size / Type</label>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                                                {allocation.plot_half ? `Half Plot (${allocation.plot_half})` : 'Full Plot'} ({allocation.plot_half ? '50ft x 100ft' : '100ft x 100ft'})
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-xs text-muted-foreground block mb-1">Base Price</label>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                ₦{(allocation.estates?.price || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Summary */}
            {
                allocation.total_price && (
                    <AllocationFinancialSummary
                        totalPrice={allocation.total_price}
                        amountPaid={allocation.amount_paid || 0}
                        status={allocation.status}
                        nextDueDate={allocation.payment_plans?.[0]?.payment_plan_installments?.find((i: any) => i.status === 'pending')?.due_date}
                        nextDueAmount={allocation.payment_plans?.[0]?.payment_plan_installments?.find((i: any) => i.status === 'pending')?.amount_due}
                        overdueInstallments={allocation.payment_plans?.[0]?.payment_plan_installments?.filter((i: any) => i.status === 'overdue')?.length || 0}
                    />
                )
            }

            {/* Payment Modules: Tabs for Plan & History */}
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <Tabs defaultValue="plan" className="w-full">
                    <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="plan">
                                <FileText className="w-4 h-4 mr-2" />
                                Payment Plan
                            </TabsTrigger>
                            <TabsTrigger value="history">
                                <History className="w-4 h-4 mr-2" />
                                Payment History
                                {allocation.payments?.length > 0 && (
                                    <span className="ml-2 bg-zinc-800 dark:bg-zinc-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        {allocation.payments.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            <CreditCard className="w-3 h-3" />
                            Financial Ledger
                        </div>
                    </div>

                    <TabsContent value="plan" className="p-0 m-0">
                        {allocation.payment_plans && allocation.payment_plans.length > 0 ? (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                <div className="px-6 py-4 bg-blue-50/30 dark:bg-blue-500/5 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Plan Overview</p>
                                        <p className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight capitalize text-lg">
                                            {allocation.plan_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Total Liability</p>
                                        <p className="font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                            ₦{allocation.payment_plans[0].total_amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b">
                                            <tr>
                                                <th className="px-6 py-3">#</th>
                                                <th className="px-6 py-3">Due Date</th>
                                                <th className="px-6 py-3">Liability</th>
                                                <th className="px-6 py-3">Settled</th>
                                                <th className="px-6 py-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                                            {allocation.payment_plans[0].payment_plan_installments
                                                .sort((a: any, b: any) => a.installment_number - b.installment_number)
                                                .map((inst: any) => (
                                                    <tr key={inst.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors" data-testid="installment-row">
                                                        <td className="px-6 py-4 font-bold text-zinc-400 text-xs">{(inst.installment_number || 0).toString().padStart(2, '0')}</td>
                                                        <td className="px-6 py-4 font-medium text-zinc-600 dark:text-zinc-400">{format(new Date(inst.due_date), 'MMM d, yyyy')}</td>
                                                        <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">₦{inst.amount_due.toLocaleString()}</td>
                                                        <td className="px-6 py-4 font-mono font-bold text-green-600 dark:text-green-400">₦{inst.amount_paid.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Badge variant={
                                                                inst.status === 'paid' ? 'success' :
                                                                    inst.status === 'overdue' ? 'destructive' :
                                                                        inst.status === 'partially_paid' ? 'warning' : 'outline'
                                                            } className="uppercase text-[9px] font-bold tracking-tighter h-5 px-1.5 py-0">
                                                                {inst.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-zinc-400 space-y-2">
                                <FileText className="w-12 h-12 mx-auto opacity-10" />
                                <p className="text-sm font-medium">No payment plan associated with this allocation</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="history" className="p-0 m-0">
                        {allocation.payments && allocation.payments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-zinc-50/80 dark:bg-zinc-900/80 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3">Method</th>
                                            <th className="px-6 py-3">Reference</th>
                                            <th className="px-6 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                                        {allocation.payments
                                            .sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                                            .map((payment: any) => (
                                                <tr key={payment.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-zinc-600 dark:text-zinc-400">{format(new Date(payment.payment_date), 'MMM d, yyyy')}</td>
                                                    <td className="px-6 py-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">₦{payment.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4 capitalize text-zinc-500 dark:text-zinc-400">{payment.method.replace('_', ' ')}</td>
                                                    <td className="px-6 py-4 font-mono text-xs text-zinc-400 dark:text-zinc-500">{payment.transaction_ref}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Badge variant={payment.status === 'verified' ? 'success' : 'outline'} className="uppercase text-[9px] font-bold tracking-tighter h-5 px-1.5 py-0">
                                                            {payment.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-zinc-400 space-y-2">
                                <History className="w-12 h-12 mx-auto opacity-10" />
                                <p className="text-sm font-medium">No payments recorded yet</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>

            <PaymentModal
                open={isPaymentModalOpen}
                onOpenChange={setIsPaymentModalOpen}
                allocationId={allocation.id}
                onSuccess={() => {
                    toast.success("Payment recorded successfully");
                    router.refresh();
                }}
            />

            <div className="space-y-4 pb-4">
                {['draft', 'pending_approval', 'approved'].includes(allocation.status) && (
                    <div className="flex justify-between items-center text-xs text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <span>Drafted by Admin</span>
                        </div>
                        <div className="flex gap-4">
                            {['sysadmin', 'ceo', 'md', 'frontdesk'].includes(profile?.role || "") && ['draft', 'pending_approval'].includes(allocation.status) && (
                                <div className="space-y-4">
                                    {/* Plot Assignment UI - Only show if draft/pending and unassigned */}
                                    {['draft', 'pending_approval'].includes(allocation.status) && !allocation.plot_id && (
                                        <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 overflow-hidden">
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-center mb-6">
                                                    <div className="space-y-1">
                                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wide">
                                                            <Grid3X3 className="w-4 h-4 text-primary" />
                                                            Final Property Selection
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            Assign a physical plot to this allocation to proceed with approval.
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] bg-white dark:bg-zinc-800 border dark:border-zinc-700 px-2 py-0.5 rounded-full font-bold text-zinc-500 dark:text-zinc-400">
                                                        {availablePlots.length} PLOTS AVAILABLE
                                                    </span>
                                                </div>

                                                {availablePlots.length === 0 ? (
                                                    <div className="p-8 border-2 border-dashed rounded-xl bg-white dark:bg-zinc-950 text-sm text-zinc-400 text-center flex flex-col items-center gap-2">
                                                        <AlertTriangle className="w-8 h-8 opacity-20" />
                                                        No available plots found in this estate.
                                                        {fetchError && <div className="text-red-500 text-xs mt-1">Error: {fetchError}</div>}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {assignPlotId && (
                                                            <div className="flex items-center justify-between p-4 border rounded-xl bg-white dark:bg-zinc-950 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 animate-in fade-in slide-in-from-top-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground font-medium mb-0.5 uppercase tracking-tighter">Selected Plot</p>
                                                                        <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                                                            #{availablePlots.find(p => p.id === assignPlotId)?.plot_number}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="sm" onClick={() => { setAssignPlotId(""); setAssignSuffix(undefined); }} className="text-zinc-400 hover:text-red-500 transition-colors">Change</Button>
                                                            </div>
                                                        )}

                                                        <Dialog open={showPlotGrid} onOpenChange={setShowPlotGrid}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" className="w-full justify-center h-14 rounded-xl border-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all font-semibold" data-testid="plot-select-trigger">
                                                                    <Grid3X3 className="mr-2 h-5 w-5 opacity-70" />
                                                                    {assignPlotId
                                                                        ? "Change Selected Plot"
                                                                        : "Browse Available Plots"
                                                                    }
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle>Select Plot</DialogTitle>
                                                                    <DialogDescription>
                                                                        Choose a plot from the grid below to assign to this allocation.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="pt-4">
                                                                    <PlotGrid
                                                                        plots={availablePlots}
                                                                        estateId={allocation.estate_id}
                                                                        targetPlotSize={allocation.plot_half ? 'half_plot' : 'full_plot'}
                                                                        onSelect={(plot, suffix) => {
                                                                            setAssignPlotId(plot.id);
                                                                            setAssignSuffix(suffix);
                                                                            setShowPlotGrid(false);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        {['draft', 'pending_approval'].includes(allocation.status) && ['sysadmin', 'ceo', 'md'].includes(profile?.role || "") && (
                                            <Button onClick={handleApprove} disabled={processing} className="px-8 h-12 shadow-lg shadow-primary/20 font-bold tracking-wide">
                                                {processing ? "Approving..." : "Approve Allocation"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
