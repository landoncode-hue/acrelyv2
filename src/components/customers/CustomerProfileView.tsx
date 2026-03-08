"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Home, Pencil, FileText, Download, Plus, MessageSquare, ExternalLink, ShieldCheck, StickyNote, Mail, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KYCStatusManager, KYCStatusBadge } from "@/components/customers/KYCStatusManager";
import { CustomerFinancialSummary } from "@/components/customers/CustomerFinancialSummary";
import { CustomerActivityTimeline } from "@/components/customers/customer-activity-timeline";
import { updateCustomerAction, addCustomerNoteAction, sendCustomerMessageAction, deleteCustomerAction, updateCustomerKYCAction } from "@/lib/actions/customer-actions";

interface CustomerProfileViewProps {
    customer: any;
    allocations: any[];
    payments: any[];
    interactions: any[];
    documents: any[];
    initialNotes: any[];
}

export function CustomerProfileView({
    customer: initialCustomer,
    allocations,
    payments,
    interactions,
    documents,
    initialNotes
}: CustomerProfileViewProps) {
    const router = useRouter();
    const { profile } = useProfile();

    // State
    const [customer, setCustomer] = useState(initialCustomer);
    const [customerNotes, setCustomerNotes] = useState(initialNotes);
    const [newNote, setNewNote] = useState("");

    // Edit State
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: initialCustomer.full_name,
        email: initialCustomer.email,
        phone: initialCustomer.phone,
        address: initialCustomer.address,
        status: initialCustomer.status
    });

    // Message State
    const [messageOpen, setMessageOpen] = useState(false);
    const [messageBody, setMessageBody] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);

    // Delete State
    const [deleteOpen, setDeleteOpen] = useState(false);

    // KYC State
    const [kycOpen, setKycOpen] = useState(false);

    // Portal Invite State
    const [inviting, setInviting] = useState(false);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !profile) return;

        try {
            const result = await addCustomerNoteAction(customer.id, newNote);
            if (result.success && result.data) {
                setCustomerNotes([result.data, ...customerNotes]);
                setNewNote("");
                toast.success("Internal note added");
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || "Failed to add note";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const result = await updateCustomerAction(customer.id, editForm);
            if (result.success) {
                toast.success("Profile updated");
                setCustomer({ ...customer, ...editForm });
                setEditOpen(false);
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || "Failed to update profile";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleSendMessage = async () => {
        if (!messageBody.trim()) return;
        setSendingMessage(true);
        try {
            const result = await sendCustomerMessageAction({
                customerId: customer.id,
                phone: customer.phone,
                message: messageBody
            });

            if (result.success) {
                toast.success("Message sent successfully");
                setMessageOpen(false);
                setMessageBody("");
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || "Failed to send message";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleDelete = async () => {
        const toastId = toast.loading("Deleting customer and related data...");
        try {
            const result = await deleteCustomerAction({
                id: customer.id,
                reason: "Admin deleted"
            });

            if (result?.success) {
                toast.dismiss(toastId);
                toast.success("Customer deleted successfully");
                router.push('/dashboard/customers');
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to delete customer";
                throw new Error(errorMessage);
            }
        } catch (err: any) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error("Failed to delete: " + err.message);
        }
    };

    const handleKYCUpdate = (status: string) => {
        setCustomer({ ...customer, kyc_status: status });
        router.refresh();
    };

    const handleInvite = async () => {
        setInviting(true);
        try {
            const res = await fetch('/api/customers/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: customer.id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(data.message || 'Invitation sent');
            router.refresh();
        } catch (e: any) {
            toast.error(e.message || 'Failed to send invite');
        } finally {
            setInviting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                    <AvatarImage src={getAvatarUrl(customer.full_name, customer.avatar_url)} />
                    <AvatarFallback>{customer.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{customer.full_name}</h1>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] uppercase text-zinc-600">
                                    ID: {customer.id.slice(0, 8)}
                                </span>
                                <span>•</span>
                                <span>Since {new Date(customer.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <Badge variant={customer.status === 'active' ? 'success' : 'secondary'} className="h-5 px-1.5 py-0 text-[10px]">
                                    {customer.status}
                                </Badge>
                                <span>•</span>
                                <KYCStatusBadge status={customer.kyc_status || 'not_started'} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/portal" target="_blank">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Portal
                                </Link>
                            </Button>
                            {!customer.profile_id && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleInvite}
                                    disabled={inviting || (!customer.email && !customer.phone)}
                                >
                                    {inviting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Mail className="mr-2 h-4 w-4" />
                                    )}
                                    Invite to Portal
                                </Button>
                            )}
                            {customer.profile_id && (
                                <Badge variant="success" className="h-7 px-2">
                                    Portal Active
                                </Badge>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setKycOpen(true)}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                KYC
                            </Button>
                            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Customer Profile</DialogTitle>
                                        <DialogDescription>Update contact details and status.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Address</Label>
                                            <Input value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleEditSubmit}>Save Changes</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Customer</DialogTitle>
                                        <DialogDescription>
                                            This action is permanent and cannot be undone.
                                        </DialogDescription>
                                        {(allocations.length > 0 || payments.length > 0) && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs text-left">
                                                <strong>Warning:</strong> This customer has {allocations.length} allocations and {payments.length} payments.
                                                Deleting this customer will <strong>permanently delete all these records</strong>.
                                            </div>
                                        )}
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleDelete}>Confirm Delete</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* KYC Status Manager */}
            <KYCStatusManager
                open={kycOpen}
                onOpenChange={setKycOpen}
                customer={{
                    id: customer.id,
                    full_name: customer.full_name,
                    kyc_status: customer.kyc_status || 'not_started'
                }}
                onUpdate={() => router.refresh()}
            />

            {/* Financial Summary Cards */}
            <CustomerFinancialSummary customerId={customer.id} />

            {/* Send Message Dialog */}
            < Dialog open={messageOpen} onOpenChange={setMessageOpen} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send SMS to {customer.full_name}</DialogTitle>
                        <DialogDescription>
                            Send a direct text message to {customer.phone}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <textarea
                                className="w-full min-h-[120px] p-3 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand-purple/20 bg-muted"
                                placeholder="Type your message here..."
                                value={messageBody}
                                onChange={e => setMessageBody(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground text-right">{messageBody.length} characters</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setMessageOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendMessage} disabled={!messageBody.trim() || sendingMessage}>
                            {sendingMessage ? "Sending..." : "Send SMS"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 border border-border rounded-lg bg-card text-card-foreground overflow-hidden h-fit space-y-4">
                    <div className="rounded-lg bg-card overflow-hidden border border-border">
                        <div className="px-6 py-4 border-b border-border bg-muted/50">
                            <h2 className="font-semibold text-sm text-foreground">Contact Information</h2>
                        </div>
                        <div className="p-0 divide-y divide-border">
                            <div className="px-6 py-4">
                                <span className="text-xs font-medium text-muted-foreground uppercase block mb-1">Email</span>
                                <p className="text-sm font-medium text-foreground">{customer.email}</p>
                            </div>
                            <div className="px-6 py-4">
                                <span className="text-xs font-medium text-muted-foreground uppercase block mb-1">Phone</span>
                                <div className="flex items-center gap-3">
                                    <a href={`tel:${customer.phone}`} className="text-sm font-medium text-foreground hover:text-brand-purple hover:underline">
                                        {customer.phone}
                                    </a>
                                    <a href={`https://wa.me/${customer.phone?.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-[#25D366]/10 text-[#25D366] px-2 py-0.5 rounded-full border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors">
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                            <div className="px-6 py-4">
                                <span className="text-xs font-medium text-muted-foreground uppercase block mb-1">Address</span>
                                <p className="text-sm font-medium text-foreground">{customer.address || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions Widget */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" variant="outline" onClick={() => router.push(`/dashboard/payments/new?customerId=${customer.id}`)}>
                                <CreditCard className="mr-2 h-4 w-4" /> Record Payment
                            </Button>
                            <Button className="w-full justify-start" variant="outline" onClick={() => setMessageOpen(true)}>
                                <MessageSquare className="mr-2 h-4 w-4" /> Send SMS
                            </Button>
                            <Button className="w-full justify-start" variant="outline" onClick={() => router.push(`/dashboard/allocations/new?customerId=${customer.id}`)}>
                                <Home className="mr-2 h-4 w-4" /> New Allocation
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Add Note Widget */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Add Note</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddNote} className="space-y-2">
                                <textarea
                                    className="w-full min-h-[80px] p-2 text-sm border rounded-md resize-none"
                                    placeholder="Log a call or note..."
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                />
                                <Button size="sm" type="submit" className="w-full" disabled={!newNote.trim()}>Log Interaction</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="timeline">
                        <TabsList>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="activity">System Activity</TabsTrigger>
                            <TabsTrigger value="allocations">Allocations ({allocations.length})</TabsTrigger>
                            <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
                            <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
                            <TabsTrigger value="notes">Internal Notes ({customerNotes.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="space-y-4">
                            <div className="space-y-4">
                                {interactions.map((log) => (
                                    <div key={log.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                            {log.author?.full_name?.substring(0, 2) || 'SYS'}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{log.author?.full_name || 'System'}</p>
                                                <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-zinc-700">{log.content}</p>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{log.type}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {interactions.length === 0 && <p className="text-center text-muted-foreground py-10">No interactions logged yet.</p>}
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Files & Contracts</h3>
                                <Button size="sm" variant="outline" disabled>
                                    <Plus className="mr-2 h-4 w-4" /> Upload
                                </Button>
                            </div>
                            <div className="border border-border rounded-lg bg-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                    {doc.name}
                                                </TableCell>
                                                <TableCell className="capitalize">{doc.type}</TableCell>
                                                <TableCell className="text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={doc.url || doc.file_path} target="_blank" rel="noopener noreferrer">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {documents.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-400">No documents found.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="allocations" className="space-y-4">
                            <div className="border border-border rounded-lg bg-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Estate</TableHead>
                                            <TableHead>Plot</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allocations.map((alloc) => (
                                            <TableRow
                                                key={alloc.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.push(`/dashboard/allocations/${alloc.id}`)}
                                            >
                                                <TableCell className="font-medium text-foreground">{alloc.estates?.name}</TableCell>
                                                <TableCell>{alloc.plots?.plot_number}</TableCell>
                                                <TableCell><Badge variant="outline" className="font-normal">{alloc.status}</Badge></TableCell>
                                                <TableCell className="text-muted-foreground">{new Date(alloc.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/dashboard/payments/new?customerId=${customer.id}&allocationId=${alloc.id}`);
                                                    }}>
                                                        Pay
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {allocations.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-400">No allocations found.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="payments" className="space-y-4">
                            <div className="border border-border rounded-lg bg-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Ref</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.map((p) => (
                                            <TableRow
                                                key={p.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.push(`/dashboard/payments/${p.id}`)}
                                            >
                                                <TableCell className="font-medium">₦{p.amount.toLocaleString()}</TableCell>
                                                <TableCell className="capitalize">{p.method?.replace('_', ' ')}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{p.transaction_ref}</TableCell>
                                                <TableCell className="text-muted-foreground">{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                        {payments.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-zinc-400">No payments found.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        {/* Internal Notes Tab (Staff Only) */}
                        <TabsContent value="notes" className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        <StickyNote className="inline h-4 w-4 mr-1" />
                                        Staff-only internal notes (not visible to customer)
                                    </p>
                                </div>
                                {customerNotes.map((note) => (
                                    <div key={note.id} className="flex gap-4 p-4 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 text-xs font-bold">
                                            {note.author?.full_name?.substring(0, 2) || 'SYS'}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">{note.author?.full_name || 'System'}</p>
                                                <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {customerNotes.length === 0 && <p className="text-center text-muted-foreground py-10">No internal notes yet.</p>}
                            </div>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                            <div className="border border-border rounded-lg bg-card p-4">
                                <h3 className="text-sm font-medium mb-4">System Audit Log</h3>
                                <CustomerActivityTimeline customerId={customer.id} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <KYCStatusManager
                open={kycOpen}
                onOpenChange={setKycOpen}
                customer={customer}
                onUpdate={handleKYCUpdate}
            />
        </div >
    );
}
