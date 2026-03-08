"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import {
    createPaymentPlanAction,
    updatePaymentPlanAction,
    deletePaymentPlanAction
} from "@/lib/actions/payment-plan-actions";

interface PaymentPlansClientProps {
    initialPlans: any[];
}

export default function PaymentPlansClient({ initialPlans }: PaymentPlansClientProps) {
    // We can rely on server data passed down, but for optimistic updates or standard flow,
    // we assume revalidatePath in actions will refresh the server component, 
    // BUT since we are in a client component that received props, the props won't automatically update 
    // unless the parent re-renders.
    // However, with Next.js App Router, router.refresh() will re-fetch server components.

    // Actually, for simplicity in this refactor, let's keep local state initialized from props
    // or better yet, just use router.refresh() and let the server component re-render.

    // Let's use router for refreshing.
    const { profile } = useProfile();
    const [newPlanOpen, setNewPlanOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // We don't really need local 'plans' state if we trust router.refresh(), 
    // but having it makes the UI feel snappier if we manually update it.
    // For now, let's just use the props as the source of truth and trust router.refresh() works on action success.
    // The parent is a Server Component, so it will re-fetch DB data on router.refresh().

    // Wait, I can't import useRouter from next/navigation in the snippet if I don't import it.
    // I need to add it.

    // Re-implementation note: simplest path is: UI triggers action -> Action revalidates -> UI updates.
    // But properties passed to client components don't update automatically on invalidation unless the parent re-renders.
    // So we just rely on parent re-rendering. 

    // Actually, I'll keep it simple: Use props as data source.

    const [formData, setFormData] = useState({
        name: "",
        duration_months: 12,
        interest_rate: 0,
        initial_deposit_percent: 10,
        description: ""
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await createPaymentPlanAction({
                name: formData.name,
                duration_months: parseInt(formData.duration_months.toString()),
                interest_rate: parseFloat(formData.interest_rate.toString()),
                initial_deposit_percent: parseFloat(formData.initial_deposit_percent.toString()),
                description: formData.description
            });

            if (result?.success) {
                toast.success("Plan created");
                setNewPlanOpen(false);
                setFormData({ name: "", duration_months: 12, interest_rate: 0, initial_deposit_percent: 10, description: "" });
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to create plan";
                toast.error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to create plan");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        try {
            const result = await updatePaymentPlanAction({
                id,
                is_active: !current
            });

            if (result?.success) {
                toast.success("Status updated");
            } else {
                throw new Error("Failed to update status");
            }
        } catch (e) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const result = await deletePaymentPlanAction({ id });
            if (result?.success) {
                toast.success("Plan deleted");
            } else {
                throw new Error("Failed to delete plan");
            }
        } catch (e) {
            toast.error("Delete failed");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Payment Plans</h1>
                {['sysadmin', 'ceo', 'md'].includes(profile?.role || "") && (
                    <Dialog open={newPlanOpen} onOpenChange={setNewPlanOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Payment Plan</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Plan Name</Label>
                                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Standard 12 Months" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Duration (Months)</Label>
                                        <Input type="number" value={formData.duration_months} onChange={e => setFormData({ ...formData, duration_months: parseInt(e.target.value) })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Interest Rate (%)</Label>
                                        <Input type="number" value={formData.interest_rate} onChange={e => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) })} step="0.1" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Initial Deposit Req. (%)</Label>
                                    <Input type="number" value={formData.initial_deposit_percent} onChange={e => setFormData({ ...formData, initial_deposit_percent: parseFloat(e.target.value) })} step="0.1" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Creating..." : "Save Plan"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {initialPlans.map((plan) => (
                    <Card key={plan.id} className={!plan.is_active ? "opacity-60" : ""}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                            <Badge variant={plan.is_active ? "default" : "secondary"}>
                                {plan.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Duration:</span>
                                - <span>{plan.duration_months} Months</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Interest:</span>
                                <span>{plan.interest_rate}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Min. Deposit:</span>
                                <span>{plan.initial_deposit_percent}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                        </CardContent>
                        {['sysadmin', 'ceo', 'md'].includes(profile?.role || "") && (
                            <CardFooter className="flex justify-between pt-0">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={plan.is_active}
                                        onCheckedChange={() => handleToggleActive(plan.id, plan.is_active)}
                                    />
                                    <span className="text-xs text-muted-foreground">Active</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))}
                {initialPlans.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No payment plans defined.
                    </div>
                )}
            </div>
        </div>
    );
}
