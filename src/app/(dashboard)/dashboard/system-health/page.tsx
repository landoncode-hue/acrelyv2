"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { logger } from "@/lib/logger";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Mail,
    MessageSquare,
    Database,
    RefreshCw,
} from "lucide-react";
import { getSystemHealthMetrics, type SystemHealthMetrics } from "@/lib/actions/analytics-actions";
import { toast } from "sonner";

export default function SystemHealthPage() {
    const { profile, loading: profileLoading } = useProfile();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<SystemHealthMetrics | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => {
        if (profile) {
            loadMetrics();
        }
    }, [profile]);

    async function loadMetrics() {
        setLoading(true);
        try {
            const { data, error } = await getSystemHealthMetrics();
            if (error) {
                toast.error(`Failed to load system health metrics: ${error}`);
            } else {
                setMetrics(data);
                setLastRefresh(new Date());
            }
        } catch (error: any) {
            logger.error("Error loading system health metrics:", error);
            toast.error("Failed to load system health metrics");
        } finally {
            setLoading(false);
        }
    }

    // RBAC Check
    if (profileLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!profile || profile.role !== "sysadmin") {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Unauthorized Access</h1>
                    <p className="text-muted-foreground mt-2">
                        Only SysAdmin can access system health dashboard.
                    </p>
                </div>
            </div>
        );
    }

    const getStatusBadge = (value: number, threshold: number) => {
        if (value === 0) {
            return <Badge className="bg-green-600">Healthy</Badge>;
        } else if (value < threshold) {
            return <Badge className="bg-yellow-600">Warning</Badge>;
        } else {
            return <Badge className="bg-red-600">Critical</Badge>;
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="System Health"
                description="Monitor system performance and communication delivery"
                actions={
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            Last refresh: {lastRefresh.toLocaleTimeString()}
                        </span>
                        <Button onClick={loadMetrics} disabled={loading} size="sm" variant="outline">
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                }
            />

            {/* SMS Health */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                SMS Delivery
                            </CardTitle>
                            <CardDescription>Termii SMS delivery status</CardDescription>
                        </div>
                        {getStatusBadge(metrics?.failed_sms_24h || 0, 10)}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Last 24 Hours</p>
                            <div className="flex items-center gap-2">
                                {(metrics?.failed_sms_24h || 0) === 0 ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span className="text-2xl font-bold">{metrics?.failed_sms_24h || 0}</span>
                                <span className="text-sm text-muted-foreground">failed</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Last 7 Days</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{metrics?.failed_sms_7d || 0}</span>
                                <span className="text-sm text-muted-foreground">failed</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Last 30 Days</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{metrics?.failed_sms_30d || 0}</span>
                                <span className="text-sm text-muted-foreground">failed</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email Health */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email Delivery
                            </CardTitle>
                            <CardDescription>Resend email delivery status</CardDescription>
                        </div>
                        {getStatusBadge(metrics?.failed_email_24h || 0, 10)}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Last 24 Hours</p>
                            <div className="flex items-center gap-2">
                                {(metrics?.failed_email_24h || 0) === 0 ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <span className="text-2xl font-bold">{metrics?.failed_email_24h || 0}</span>
                                <span className="text-sm text-muted-foreground">failed</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Last 7 Days</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{metrics?.failed_email_7d || 0}</span>
                                <span className="text-sm text-muted-foreground">failed</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Last 30 Days</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">{metrics?.failed_email_30d || 0}</span>
                                <span className="text-sm text-muted-foreground">failed</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* System Errors */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                System Errors
                            </CardTitle>
                            <CardDescription>Recent errors from audit logs</CardDescription>
                        </div>
                        {getStatusBadge(metrics?.recent_errors_count || 0, 5)}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Last 24 Hours</p>
                        <div className="flex items-center gap-2">
                            {(metrics?.recent_errors_count || 0) === 0 ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                            )}
                            <span className="text-2xl font-bold">{metrics?.recent_errors_count || 0}</span>
                            <span className="text-sm text-muted-foreground">errors logged</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Storage (Placeholder) */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Storage Usage
                            </CardTitle>
                            <CardDescription>File Storage metrics</CardDescription>
                        </div>
                        <Badge>Coming Soon</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Storage metrics will be available once integrated with the storage service.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
