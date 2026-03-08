"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { ArrowLeft, UserCog, Ban, Trash2, Key, UserCheck, Mail, Phone, Calendar, Building, Hash } from "lucide-react";
import { getAvatarUrl, getInitials } from "@/lib/avatars/dicebear";
import Link from "next/link";
import { useState } from "react";

interface StaffProfile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    role: string;
    staff_status?: string;
    employee_id?: string;
    avatar_url?: string;
    dicebear_seed?: string;
    metadata?: any;
    created_at: string;
}

interface StaffHistoryEntry {
    id: string;
    previous_role?: string;
    new_role?: string;
    previous_status?: string;
    new_status?: string;
    reason?: string;
    changed_by?: string;
    created_at: string;
    metadata?: any;
}

interface AuditLogEntry {
    id: string;
    action_type: string;
    created_at: string;
    ip_address?: string;
    changes?: any;
}

interface StaffDetailClientProps {
    staffId: string;
    initialStaffProfile: StaffProfile | null;
    initialHistory: StaffHistoryEntry[];
    initialAuditLogs: AuditLogEntry[];
}

export default function StaffDetailClient({
    staffId,
    initialStaffProfile,
    initialHistory,
    initialAuditLogs
}: StaffDetailClientProps) {
    const router = useRouter();
    const { profile } = useProfile();

    // We use state to allow optimistic updates or refreshing
    const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(initialStaffProfile);
    const [history, setHistory] = useState<StaffHistoryEntry[]>(initialHistory);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);

    const handleSuspend = async () => {
        if (!staffProfile) return;

        const reason = prompt(`Enter reason for suspending ${staffProfile.full_name}:`);
        if (!reason) return;

        try {
            const response = await fetch(`/api/staff/${staffId}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to suspend staff');
            }

            toast.success("Staff member suspended");
            // Optimistic update
            setStaffProfile({ ...staffProfile, staff_status: 'suspended' });
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDeactivate = async () => {
        if (!staffProfile) return;

        const reason = prompt(`Enter reason for deactivating ${staffProfile.full_name}:`);
        if (!reason) return;

        if (!confirm(`Are you sure you want to deactivate ${staffProfile.full_name}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/staff/${staffId}/deactivate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to deactivate staff');
            }

            toast.success("Staff member deactivated");
            router.push('/dashboard/staff');
        } catch (e: any) {
            toast.error(e.message);
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

    if (!staffProfile) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Staff member not found</p>
                <Link href="/dashboard/staff">
                    <Button variant="link">Back to Staff List</Button>
                </Link>
            </div>
        );
    }

    // Only Admin Access
    if (!['sysadmin', 'ceo', 'md'].includes(profile?.role || "")) {
        return <div className="text-center py-12 text-muted-foreground">Unauthorized</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/staff">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
            </div>

            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={getAvatarUrl(staffProfile)} />
                                <AvatarFallback className="text-2xl">{getInitials(staffProfile.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold">{staffProfile.full_name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    {getRoleBadge(staffProfile.role)}
                                    {getStatusBadge(staffProfile.staff_status)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{staffProfile.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <UserCog className="mr-2 h-4 w-4" />
                                Change Role
                            </Button>
                            {staffProfile.staff_status !== 'suspended' && (
                                <Button variant="outline" size="sm" onClick={handleSuspend}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend
                                </Button>
                            )}
                            {staffProfile.staff_status === 'suspended' && (
                                <Button variant="outline" size="sm">
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Reactivate
                                </Button>
                            )}
                            <Button variant="outline" size="sm">
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDeactivate}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deactivate
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Basic contact details and employee information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground">{staffProfile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <p className="text-sm text-muted-foreground">{staffProfile.phone || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Hash className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Employee ID</p>
                                        <p className="text-sm text-muted-foreground font-mono">{staffProfile.employee_id || "Not assigned"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Department</p>
                                        <p className="text-sm text-muted-foreground">{staffProfile.metadata?.department || "Not assigned"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Joined</p>
                                        <p className="text-sm text-muted-foreground">{new Date(staffProfile.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Login history and recent Actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {auditLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
                            ) : (
                                <div className="space-y-4">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{log.action_type.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString()}
                                                    {log.ip_address && ` • IP: ${log.ip_address}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Permissions</CardTitle>
                            <CardDescription>Capabilities based on {staffProfile.role} role</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {staffProfile.role === 'sysadmin' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Full system access</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Manage all staff</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">System settings access</span>
                                        </div>
                                    </>
                                )}
                                {staffProfile.role === 'ceo' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Manage staff</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Approve allocations</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">View all reports</span>
                                        </div>
                                    </>
                                )}
                                {staffProfile.role === 'md' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Approve allocations</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">View reports</span>
                                        </div>
                                    </>
                                )}
                                {staffProfile.role === 'frontdesk' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Create allocations</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Record payments</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-sm">Manage customers</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change History</CardTitle>
                            <CardDescription>Timeline of role and status changes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No history recorded</p>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((entry) => (
                                        <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-0">
                                            <div className="flex flex-col items-center">
                                                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                                                <div className="w-px bg-border flex-1 mt-2" />
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2">
                                                    {entry.previous_role && entry.new_role && (
                                                        <p className="text-sm font-medium">
                                                            Role changed: {entry.previous_role} → {entry.new_role}
                                                        </p>
                                                    )}
                                                    {entry.previous_status && entry.new_status && (
                                                        <p className="text-sm font-medium">
                                                            Status changed: {entry.previous_status} → {entry.new_status}
                                                        </p>
                                                    )}
                                                </div>
                                                {entry.reason && (
                                                    <p className="text-sm text-muted-foreground mt-1">Reason: {entry.reason}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(entry.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
