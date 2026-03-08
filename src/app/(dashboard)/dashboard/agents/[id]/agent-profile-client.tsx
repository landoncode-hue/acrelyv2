"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, ArrowLeft, Mail, Phone, MapPin, Briefcase, User, CreditCard, Pencil } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTable, Column } from "@/components/smart-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { approveAgentAction, rejectAgentAction } from "@/lib/actions/agent-actions";
import { updateAgentAction } from "@/lib/actions/agent-actions";

export function AgentProfileClient({
    agent,
    allocations,
    commissions,
    withdrawals
}: any) {
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        commission_rate: agent.commission_rate,
        status: agent.status
    });
    const [updating, setUpdating] = useState(false);

    const stats = {
        totalSales: allocations?.reduce((acc: number, curr: any) => acc + (curr.final_price || 0), 0) || 0,
        totalCommission: commissions?.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0,
        paidCommission: withdrawals?.filter((w: any) => w.status === 'paid').reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        try {
            const result = action === 'approve'
                ? await approveAgentAction({ agentId: agent.id })
                : await rejectAgentAction({ agentId: agent.id });

            if (result?.success) {
                toast.success(`Agent ${action}d successfully`);
                router.refresh();
            } else {
                throw new Error(typeof result?.error === 'string' ? result.error : result?.error?.message || `Failed to ${action} agent`);
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleUpdateAgent = async () => {
        setUpdating(true);
        try {
            const res = await updateAgentAction({
                agentId: agent.id,
                commission_rate: Number(editForm.commission_rate),
                status: editForm.status as any
            });

            if (res.success) {
                toast.success("Agent updated successfully");
                setEditOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to update agent");
            }
        } catch (e: any) {
            toast.error(e.message || "Update failed");
        } finally {
            setUpdating(false);
        }
    };

    // Columns Definitions
    const allocationColumns: Column<any>[] = [
        { header: "Date", cell: (row) => format(new Date(row.created_at), 'MMM d, yyyy') },
        { header: "Customer", cell: (row) => row.customer_name || 'Unknown' },
        { header: "Property", cell: (row) => `${row.estate_name} - Plot ${row.plot_number}` },
        { header: "Amount", cell: (row) => `${formatCurrency(row.final_price)}` },
        { header: "Status", cell: (row) => <Badge variant="outline" className="capitalize">{row.status}</Badge> }
    ];

    const commissionColumns: Column<any>[] = [
        { header: "Date", cell: (row) => format(new Date(row.created_at), 'MMM d, yyyy') },
        { header: "For", cell: (row) => row.description },
        { header: "Amount", cell: (row) => <span className="text-green-600 font-medium">+{formatCurrency(row.amount)}</span> },
        { header: "Type", cell: (row) => row.type }
    ];

    const withdrawalColumns: Column<any>[] = [
        { header: "Date", cell: (row) => format(new Date(row.created_at), 'MMM d, yyyy') },
        { header: "Amount", cell: (row) => `${formatCurrency(row.amount)}` },
        { header: "Bank", cell: (row) => `${row.bank_name} - ${row.account_number}` },
        {
            header: "Status", cell: (row) => (
                <Badge variant={
                    row.status === 'paid' ? 'success' :
                        row.status === 'approved' ? 'info' :
                            row.status === 'rejected' ? 'destructive' : 'warning'
                }>
                    {row.status}
                </Badge>
            )
        }
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading">{agent.full_name}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" /> {agent.email}
                            <span className="text-border">|</span>
                            <Badge variant={agent.status === 'active' ? 'success' : agent.status === 'pending' ? 'warning' : 'secondary'} className="capitalize">
                                {agent.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {agent.status === 'pending' ? (
                        <>
                            <Button variant="outline" className="text-destructive border-destructive/20" onClick={() => handleAction('reject')}>
                                <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button className="bg-success hover:bg-success/90 text-white" onClick={() => handleAction('approve')}>
                                <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit Agent
                        </Button>
                    )}
                </div>
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Agent Details</DialogTitle>
                        <DialogDescription>Update commission rate and status.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Commission Rate (%)</Label>
                            <Input
                                type="number"
                                value={editForm.commission_rate}
                                onChange={e => setEditForm({ ...editForm, commission_rate: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editForm.status} onValueChange={val => setEditForm({ ...editForm, status: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateAgent} disabled={updating}>
                            {updating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {agent.status === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2 text-sm font-medium text-muted-foreground">Total Sales Volume</CardHeader>
                        <CardContent className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 text-sm font-medium text-muted-foreground">Total Commission</CardHeader>
                        <CardContent className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCommission)}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 text-sm font-medium text-muted-foreground">Paid Out</CardHeader>
                        <CardContent className="text-2xl font-bold text-blue-600">{formatCurrency(stats.paidCommission)}</CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {agent.status === 'active' && (
                        <>
                            <TabsTrigger value="customers">Customers & Sales</TabsTrigger>
                            <TabsTrigger value="commissions">Commissions</TabsTrigger>
                            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                        </>
                    )}
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                                            {agent.full_name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{agent.full_name}</p>
                                        <p className="text-sm text-muted-foreground">Joined {format(new Date(agent.created_at), 'PPP')}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground"><Phone className="h-3 w-3 inline mr-1" /> Phone</span><span>{agent.phone || 'N/A'}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground"><MapPin className="h-3 w-3 inline mr-1" /> Address</span><span>{agent.application_data?.address || 'N/A'}</span></div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4" /> Professional</CardTitle></CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div><span className="text-muted-foreground block mb-1">Bio</span><p className="bg-muted/30 p-2 rounded border">{agent.application_data?.bio || "No bio."}</p></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Experience</span><span>{agent.application_data?.experience || 0} years</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Commission Rate</span><span className="font-bold">{agent.commission_rate}%</span></div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Banking Details</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Bank Name</span><span className="font-medium">{agent.bank_name || 'Not set'}</span></div>
                                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Account Number</span><span className="font-mono">{agent.account_number || 'Not set'}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="italic">{agent.account_name || 'Not set'}</span></div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="customers">
                    <Card>
                        <CardHeader><CardTitle>Sales History</CardTitle></CardHeader>
                        <CardContent><SmartTable data={allocations} columns={allocationColumns} /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="commissions">
                    <Card>
                        <CardHeader><CardTitle>Commission Log</CardTitle></CardHeader>
                        <CardContent><SmartTable data={commissions} columns={commissionColumns} /></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="withdrawals">
                    <Card>
                        <CardHeader><CardTitle>Withdrawal History</CardTitle></CardHeader>
                        <CardContent><SmartTable data={withdrawals} columns={withdrawalColumns} /></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
