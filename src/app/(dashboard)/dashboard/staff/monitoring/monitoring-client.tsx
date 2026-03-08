"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, UserMinus, Activity } from "lucide-react";

interface StaffMetrics {
    total: number;
    active: number;
    invited: number;
    suspended: number;
    deactivated: number;
}

interface RecentActivity {
    id: string;
    action_type: string;
    actor_role: string;
    created_at: string;
    changes?: any;
}

interface StaffMonitoringClientProps {
    metrics: StaffMetrics;
    recentActivity: RecentActivity[];
}

export default function StaffMonitoringClient({ metrics, recentActivity }: StaffMonitoringClientProps) {
    const getActionBadge = (actionType: string) => {
        const colors: Record<string, string> = {
            STAFF_INVITED: "bg-blue-50 text-blue-700 border-blue-200",
            STAFF_ACTIVATED: "bg-green-50 text-green-700 border-green-200",
            STAFF_SUSPENDED: "bg-orange-50 text-orange-700 border-orange-200",
            STAFF_DEACTIVATED: "bg-red-50 text-red-700 border-red-200",
            ROLE_CHANGED: "bg-purple-50 text-purple-700 border-purple-200",
            IMPERSONATION_STARTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
        };

        return (
            <Badge variant="outline" className={colors[actionType] || "bg-gray-50 text-gray-700 border-gray-200"}>
                {actionType.replace(/_/g, ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Staff Monitoring</h1>
                <p className="text-muted-foreground">Overview of staff status and recent activity</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.total}</div>
                        <p className="text-xs text-muted-foreground">All staff members</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{metrics.active}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invited</CardTitle>
                        <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{metrics.invited}</div>
                        <p className="text-xs text-muted-foreground">Pending signup</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                        <UserMinus className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{metrics.suspended}</div>
                        <p className="text-xs text-muted-foreground">Temporarily blocked</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Deactivated</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{metrics.deactivated}</div>
                        <p className="text-xs text-muted-foreground">Permanently removed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Staff Activity</CardTitle>
                    <CardDescription>Latest staff management actions</CardDescription>
                </CardHeader>
                <CardContent>
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No recent activity</div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start justify-between pb-4 border-b last:border-0">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getActionBadge(activity.action_type)}
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {activity.actor_role}
                                            </Badge>
                                        </div>
                                        {activity.changes && (
                                            <p className="text-sm text-muted-foreground">
                                                {activity.changes.reason && `Reason: ${activity.changes.reason}`}
                                                {activity.changes.previous_role && activity.changes.new_role &&
                                                    `Role: ${activity.changes.previous_role} → ${activity.changes.new_role}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(activity.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Alerts */}
            {metrics.suspended > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                        <CardTitle className="text-orange-900">⚠️ Attention Required</CardTitle>
                        <CardDescription className="text-orange-700">
                            You have {metrics.suspended} suspended staff member{metrics.suspended > 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-orange-800">
                            Review suspended staff members and reactivate or deactivate them as appropriate.
                        </p>
                    </CardContent>
                </Card>
            )}

            {metrics.invited > 5 && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="text-blue-900">📧 Pending Invitations</CardTitle>
                        <CardDescription className="text-blue-700">
                            You have {metrics.invited} pending staff invitation{metrics.invited > 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-blue-800">
                            Follow up with invited staff members to ensure they complete their signup.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
