"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, MoreVertical, Search, Upload, Download, UserCog, Ban, Trash2, Key, UserCheck, Users } from "lucide-react";
import { getAvatarUrl, getInitials } from "@/lib/avatars/dicebear";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmActionDialog } from "@/components/staff/confirm-action-dialog";
import { StaffMember, Profile } from "@/lib/repositories/types";
import {
    inviteStaffAction,
    updateStaffRoleAction,
    updateStaffStatusAction,
    resetStaffPasswordAction
} from "@/lib/actions/staff-actions";

interface StaffClientProps {
    initialStaff: StaffMember[];
    currentUserProfile: Profile;
}

export function StaffClient({ initialStaff, currentUserProfile }: StaffClientProps) {
    const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
    const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>(initialStaff);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const [newStaffOpen, setNewStaffOpen] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        role: "frontdesk" as any,
        employee_id: "",
        department: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [inviteStatus, setInviteStatus] = useState<string>("");

    // Confirmation dialog states
    const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; staffId: string; staffName: string }>({
        open: false,
        staffId: "",
        staffName: ""
    });
    const [deactivateDialog, setDeactivateDialog] = useState<{ open: boolean; staffId: string; staffName: string }>({
        open: false,
        staffId: "",
        staffName: ""
    });
    const [changeRoleDialog, setChangeRoleDialog] = useState<{ open: boolean; staffId: string; staffName: string; newRole: string; reason: string }>({
        open: false, staffId: "", staffName: "", newRole: "", reason: ""
    });
    const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; staffId: string; staffName: string }>({
        open: false, staffId: "", staffName: ""
    });
    const [actionLoading, setActionLoading] = useState(false);

    const handleChangeRole = async () => {
        if (!changeRoleDialog.staffId || !changeRoleDialog.newRole) return;
        setActionLoading(true);
        try {
            const result = await updateStaffRoleAction({
                staffId: changeRoleDialog.staffId,
                role: changeRoleDialog.newRole as any,
                reason: changeRoleDialog.reason
            });

            if (!result.success) throw new Error(result.error?.message || 'Failed to update role');

            toast.success("Role updated successfully");
            setChangeRoleDialog({ open: false, staffId: '', staffName: '', newRole: '', reason: '' });

            // Update local state
            setStaff(prev => prev.map(s => s.id === changeRoleDialog.staffId ? { ...s, role: changeRoleDialog.newRole as any } : s));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordDialog.staffId) return;
        setActionLoading(true);
        try {
            const result = await resetStaffPasswordAction({ staffId: resetPasswordDialog.staffId });
            if (!result.success) throw new Error(result.error?.message || 'Failed to send reset email');

            toast.success(`Password reset email sent to ${resetPasswordDialog.staffName}`);
            setResetPasswordDialog({ open: false, staffId: '', staffName: '' });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Filter staff based on search and filters
    useEffect(() => {
        let filtered = staff;

        if (searchQuery) {
            filtered = filtered.filter(s =>
                s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter(s => s.role === roleFilter);
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(s => s.staff_status === statusFilter);
        }

        setFilteredStaff(filtered);
    }, [searchQuery, roleFilter, statusFilter, staff]);

    const handleInviteStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setInviteStatus("Sending invitation...");
        try {
            const result = await inviteStaffAction(formData);

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to invite staff');
            }

            setInviteStatus("✓ Invitation sent successfully!");
            toast.success("Staff member invited successfully! Invitation email sent.");

            // Reset form after short delay
            setTimeout(() => {
                setNewStaffOpen(false);
                setFormData({ full_name: "", phone: "", email: "", role: "frontdesk", employee_id: "", department: "" });
                setInviteStatus("");
            }, 1500);

            // Fetch would be better but for minimal change we can reload or add to state
            // Revalidation handles the server side, but since we have local state:
            if (result.data) {
                // Note: result.data might not have all fields, but we should probably just refresh
                window.location.reload();
            }
        } catch (e: any) {
            setInviteStatus("");
            toast.error(e.message || "Failed to invite staff");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSuspend = async (reason?: string) => {
        setActionLoading(true);
        try {
            const result = await updateStaffStatusAction({
                staffId: suspendDialog.staffId,
                status: 'suspended',
                reason
            });

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to suspend staff');
            }

            toast.success("Staff member suspended");
            setSuspendDialog({ open: false, staffId: "", staffName: "" });
            setStaff(prev => prev.map(s => s.id === suspendDialog.staffId ? { ...s, staff_status: 'suspended' } : s));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeactivate = async (reason?: string) => {
        setActionLoading(true);
        try {
            const result = await updateStaffStatusAction({
                staffId: deactivateDialog.staffId,
                status: 'deactivated',
                reason
            });

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to deactivate staff');
            }

            toast.success("Staff member deactivated");
            setDeactivateDialog({ open: false, staffId: "", staffName: "" });
            setStaff(prev => prev.map(s => s.id === deactivateDialog.staffId ? { ...s, staff_status: 'deactivated' } : s));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'invited':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Invited</Badge>;
            case 'active':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
            case 'suspended':
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Suspended</Badge>;
            case 'deactivated':
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Deactivated</Badge>;
            default:
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            sysadmin: "bg-purple-50 text-purple-700 border-purple-200",
            ceo: "bg-indigo-50 text-indigo-700 border-indigo-200",
            md: "bg-blue-50 text-blue-700 border-blue-200",
            frontdesk: "bg-teal-50 text-teal-700 border-teal-200",
        };

        return (
            <Badge variant="outline" className={colors[role] || "bg-gray-50 text-gray-700 border-gray-200"}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff Management"
                description="Manage staff members, roles, and permissions"
                actions={
                    <div className="flex gap-2">
                        <Link href="/dashboard/staff/import">
                            <Button variant="outline" size="sm">
                                <Upload className="mr-2 h-4 w-4" />
                                Import CSV
                            </Button>
                        </Link>
                        <Dialog open={newStaffOpen} onOpenChange={setNewStaffOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Invite Staff
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Invite New Staff Member</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleInviteStaff} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Full Name *</Label>
                                        <Input
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                            placeholder="+234..."
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role *</Label>
                                        <Select onValueChange={val => setFormData({ ...formData, role: val as any })} value={formData.role}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currentUserProfile?.role === 'sysadmin' && <SelectItem value="sysadmin">SysAdmin</SelectItem>}
                                                <SelectItem value="ceo">CEO</SelectItem>
                                                <SelectItem value="md">MD</SelectItem>
                                                <SelectItem value="frontdesk">Front Desk</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Employee ID</Label>
                                        <Input
                                            placeholder="EMP-001"
                                            value={formData.employee_id}
                                            onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Department</Label>
                                        <Input
                                            placeholder="Sales, Operations, etc."
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        />
                                    </div>
                                    {inviteStatus && (
                                        <div className={`text-sm text-center ${inviteStatus.includes('✓') ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {inviteStatus}
                                        </div>
                                    )}
                                    <Button type="submit" className="w-full" disabled={submitting}>
                                        {submitting ? "Sending Invitation..." : "Send Invitation"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                }
            />

            {/* Filters */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or employee ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="sysadmin">SysAdmin</SelectItem>
                        <SelectItem value="ceo">CEO</SelectItem>
                        <SelectItem value="md">MD</SelectItem>
                        <SelectItem value="frontdesk">Front Desk</SelectItem>
                    </SelectContent>
                </Select>

                {/* Confirmation Dialogs */}
                <ConfirmActionDialog
                    open={suspendDialog.open}
                    onOpenChange={(open) => setSuspendDialog({ ...suspendDialog, open })}
                    title="Suspend Staff Member"
                    description={`Are you sure you want to suspend ${suspendDialog.staffName}? They will not be able to access the system until reactivated.`}
                    actionLabel="Suspend"
                    actionVariant="destructive"
                    requireReason={true}
                    onConfirm={handleSuspend}
                    loading={actionLoading}
                />

                <ConfirmActionDialog
                    open={deactivateDialog.open}
                    onOpenChange={(open) => setDeactivateDialog({ ...deactivateDialog, open })}
                    title="Deactivate Staff Member"
                    description={`Are you sure you want to deactivate ${deactivateDialog.staffName}? This is a permanent action but can be reversed by an administrator.`}
                    actionLabel="Deactivate"
                    actionVariant="destructive"
                    requireReason={true}
                    onConfirm={handleDeactivate}
                    loading={actionLoading}
                />

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="invited">Invited</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="deactivated">Deactivated</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Staff Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff Member</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Employee ID</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStaff.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={getAvatarUrl(s)} />
                                            <AvatarFallback>{getInitials(s.full_name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{s.full_name}</div>
                                            <div className="text-sm text-muted-foreground">{s.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{s.phone || "—"}</div>
                                </TableCell>
                                <TableCell>{getRoleBadge(s.role)}</TableCell>
                                <TableCell>{getStatusBadge(s.staff_status)}</TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm">{s.employee_id || "—"}</span>
                                </TableCell>
                                <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/staff/${s.id}`}>
                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setChangeRoleDialog({ open: true, staffId: s.id, staffName: s.full_name || '', newRole: s.role, reason: '' })}>
                                                <UserCog className="mr-2 h-4 w-4" />
                                                Change Role
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setResetPasswordDialog({ open: true, staffId: s.id, staffName: s.full_name || '' })}>
                                                <Key className="mr-2 h-4 w-4" />
                                                Reset Password
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={() => setSuspendDialog({ open: true, staffId: s.id, staffName: s.full_name || '' })} className="text-orange-600">
                                                <Ban className="mr-2 h-4 w-4" />
                                                Suspend
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setDeactivateDialog({ open: true, staffId: s.id, staffName: s.full_name || '' })}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Deactivate
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredStaff.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <EmptyState
                                        title={searchQuery || roleFilter !== "all" || statusFilter !== "all" ? "No matches found" : "No Staff Found"}
                                        description={searchQuery || roleFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters." : "Start by adding your first staff member."}
                                        icon={Users}
                                        actionLabel={searchQuery || roleFilter !== "all" || statusFilter !== "all" ? "Clear Filters" : "Invite Staff"}
                                        onAction={searchQuery || roleFilter !== "all" || statusFilter !== "all" ? () => { setSearchQuery(""); setRoleFilter("all"); setStatusFilter("all"); } : () => setNewStaffOpen(true)}
                                        className="py-12"
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-sm text-muted-foreground">
                Showing {filteredStaff.length} of {staff.length} staff members
            </div>

            {/* Change Role Dialog */}
            <Dialog open={changeRoleDialog.open} onOpenChange={open => setChangeRoleDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Role for {changeRoleDialog.staffName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>New Role</Label>
                            <Select
                                value={changeRoleDialog.newRole}
                                onValueChange={val => setChangeRoleDialog(prev => ({ ...prev, newRole: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sysadmin">SysAdmin</SelectItem>
                                    <SelectItem value="ceo">CEO</SelectItem>
                                    <SelectItem value="md">MD</SelectItem>
                                    <SelectItem value="frontdesk">Front Desk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason (Optional)</Label>
                            <Input
                                placeholder="Why is this role changing?"
                                onChange={e => setChangeRoleDialog(prev => ({ ...prev, reason: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setChangeRoleDialog({ open: false, staffId: '', staffName: '', newRole: '', reason: '' })}>Cancel</Button>
                        <Button onClick={handleChangeRole} disabled={actionLoading}>
                            {actionLoading ? "Updating..." : "Update Role"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <ConfirmActionDialog
                open={resetPasswordDialog.open}
                onOpenChange={open => setResetPasswordDialog(prev => ({ ...prev, open }))}
                title="Reset Password"
                description={`Send a password reset email to ${resetPasswordDialog.staffName}? They will receive a link to set a new password.`}
                actionLabel="Send Reset Link"
                actionVariant="default"
                onConfirm={handleResetPassword}
                loading={actionLoading}
            />
        </div>
    );
}
