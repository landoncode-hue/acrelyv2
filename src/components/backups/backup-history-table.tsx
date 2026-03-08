"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, XCircle, Clock, Cloud, CloudOff } from "lucide-react";
import { format } from "date-fns";

interface Backup {
    id: string;
    backup_type: string;
    status: string;
    file_name: string;
    file_size_bytes: number;
    storage_path: string;
    cloud_sync_status: string | null;
    checksum: string;
    started_at: string;
    completed_at: string | null;
    created_at: string;
}

export function BackupHistoryTable() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBackups = async () => {
        try {
            const response = await fetch("/api/backups/status");
            if (response.ok) {
                const data = await response.json();
                setBackups(data.recent_backups || []);
            }
        } catch (error) {
            console.error("Failed to fetch backups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
        // Refresh every minute
        const interval = setInterval(fetchBackups, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
            case "running":
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
            case "failed":
                return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getCloudSyncBadge = (status: string | null) => {
        if (!status) return null;

        switch (status) {
            case "synced":
                return <div title="Synced to cloud"><Cloud className="h-4 w-4 text-green-600" /></div>;
            case "pending":
                return <div title="Sync pending"><Clock className="h-4 w-4 text-yellow-600" /></div>;
            case "failed":
                return <div title="Sync failed"><CloudOff className="h-4 w-4 text-red-600" /></div>;
            default:
                return null;
        }
    };

    const downloadBackup = async (backup: Backup) => {
        try {
            // This would need to be implemented with a proper download endpoint
            alert("Download functionality to be implemented");
        } catch (error) {
            console.error("Failed to download backup:", error);
        }
    };

    if (loading) {
        return (
            <div className="rounded-md border">
                <div className="p-8 text-center text-gray-500">
                    Loading backups...
                </div>
            </div>
        );
    }

    if (backups.length === 0) {
        return (
            <div className="rounded-md border">
                <div className="p-8 text-center text-gray-500">
                    No backups found. Create your first backup to get started.
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Cloud</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {backups.map((backup) => {
                        const duration = backup.completed_at
                            ? Math.round((new Date(backup.completed_at).getTime() - new Date(backup.started_at).getTime()) / 1000)
                            : null;

                        return (
                            <TableRow key={backup.id}>
                                <TableCell className="font-medium">
                                    {format(new Date(backup.created_at), "MMM d, yyyy HH:mm")}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {backup.backup_type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(backup.status)}</TableCell>
                                <TableCell>{formatBytes(backup.file_size_bytes || 0)}</TableCell>
                                <TableCell>{getCloudSyncBadge(backup.cloud_sync_status)}</TableCell>
                                <TableCell>
                                    {duration !== null ? `${duration}s` : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {backup.status === "completed" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => downloadBackup(backup)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
