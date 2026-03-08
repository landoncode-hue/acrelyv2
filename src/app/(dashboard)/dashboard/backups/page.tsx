import { Metadata } from "next";
import { BackupOverviewCards } from "@/components/backups/backup-overview-cards";
import { BackupHistoryTable } from "@/components/backups/backup-history-table";
import { Database } from "lucide-react";

export const metadata: Metadata = {
    title: "Backups & Disaster Recovery | Acrely",
    description: "Manage database backups and disaster recovery",
};

export default function BackupsPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Backups & Disaster Recovery</h2>
                        <p className="text-gray-500">
                            Manage database backups, monitor system health, and ensure business continuity
                        </p>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <BackupOverviewCards />

            {/* Backup History */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold">Backup History</h3>
                    <p className="text-sm text-gray-500">
                        View and manage all database backups
                    </p>
                </div>
                <BackupHistoryTable />
            </div>

            {/* Info Section */}
            <div className="rounded-lg border bg-gray-50 p-6">
                <h4 className="font-semibold mb-2">About Backups</h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <p>
                        <strong>Automated Backups:</strong> Daily backups run automatically at 2 AM UTC
                    </p>
                    <p>
                        <strong>Retention Policy:</strong> Backups are retained for 7 days by default
                    </p>
                    <p>
                        <strong>Cloud Sync:</strong> Backups are automatically synced to cloud storage for offsite protection
                    </p>
                    <p>
                        <strong>Point-in-Time Recovery (PITR):</strong> Enable PITR in Server Console for granular recovery options
                    </p>
                </div>
            </div>
        </div>
    );
}
