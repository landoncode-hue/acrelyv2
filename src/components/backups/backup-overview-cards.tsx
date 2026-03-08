"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Clock, HardDrive, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BackupStatus {
    latest_backup: {
        last_backup_time: string;
        last_backup_status: string;
        last_backup_size: number;
        hours_since_last_backup: number;
    } | null;
    statistics: {
        total_backups: number;
        successful_backups: number;
        failed_backups: number;
        total_storage_bytes: number;
        success_rate: number;
    } | null;
    health: {
        is_healthy: boolean;
        health_message: string;
        last_backup_age_hours: number;
        pending_cloud_syncs: number;
        recent_failures: number;
    } | null;
    running_backup: any | null;
}

export function BackupOverviewCards() {
    const [status, setStatus] = useState<BackupStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    const fetchStatus = async () => {
        try {
            const response = await fetch("/api/backups/status");
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error("Failed to fetch backup status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const triggerBackup = async () => {
        setTriggering(true);
        try {
            const response = await fetch("/api/backups/trigger", {
                method: "POST",
            });

            if (response.ok) {
                // Refresh status after triggering
                setTimeout(fetchStatus, 2000);
            } else {
                const error = await response.json();
                alert(error.error || "Failed to trigger backup");
            }
        } catch (error) {
            console.error("Failed to trigger backup:", error);
            alert("Failed to trigger backup");
        } finally {
            setTriggering(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </Card>
                ))}
            </div>
        );
    }

    const isHealthy = status?.health?.is_healthy ?? true;
    const hasRunningBackup = !!status?.running_backup;

    return (
        <div className="space-y-4">
            {/* Health Alert */}
            {!isHealthy && (
                <Card className="p-4 border-yellow-500 bg-yellow-50">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div className="flex-1">
                            <p className="font-medium text-yellow-900">Backup System Warning</p>
                            <p className="text-sm text-yellow-700">{status?.health?.health_message}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Running Backup Alert */}
            {hasRunningBackup && (
                <Card className="p-4 border-blue-500 bg-blue-50">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                        <div className="flex-1">
                            <p className="font-medium text-blue-900">Backup In Progress</p>
                            <p className="text-sm text-blue-700">
                                Started {formatDistanceToNow(new Date(status.running_backup.started_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Last Backup */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Last Backup</p>
                            {status?.latest_backup ? (
                                <>
                                    <p className="text-2xl font-bold">
                                        {formatDistanceToNow(new Date(status.latest_backup.last_backup_time), { addSuffix: true })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatBytes(status.latest_backup.last_backup_size)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-2xl font-bold text-gray-400">No backups</p>
                            )}
                        </div>
                        <Database className={`h-8 w-8 ${isHealthy ? "text-green-600" : "text-yellow-600"}`} />
                    </div>
                </Card>

                {/* Total Backups */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Backups</p>
                            <p className="text-2xl font-bold">{status?.statistics?.total_backups || 0}</p>
                            <p className="text-xs text-gray-500">
                                {status?.statistics?.success_rate?.toFixed(1) || 0}% success rate
                            </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>

                {/* Storage Used */}
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Storage Used</p>
                            <p className="text-2xl font-bold">
                                {formatBytes(status?.statistics?.total_storage_bytes || 0)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {status?.statistics?.total_backups || 0} files
                            </p>
                        </div>
                        <HardDrive className="h-8 w-8 text-purple-600" />
                    </div>
                </Card>

                {/* Manual Backup */}
                <Card className="p-6">
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Manual Backup</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Trigger a backup now
                            </p>
                        </div>
                        <Button
                            onClick={triggerBackup}
                            disabled={triggering || hasRunningBackup}
                            className="mt-4 w-full"
                        >
                            {triggering ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Starting...
                                </>
                            ) : hasRunningBackup ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4" />
                                    In Progress
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Create Backup
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
