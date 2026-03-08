"use client";

import { Badge } from "@/components/ui/badge";
import { SmartTable, Column } from "@/components/smart-table";
import { PageHeader } from "@/components/layout/page-header";

interface AuditLog {
    id: string;
    action_type: string;
    actor_role: string;
    actor_user_id: string;
    target_type: string;
    target_id: string;
    ip_address: string;
    created_at: string;
    changes: any;
    profiles?: { full_name: string, email: string };
}

export default function AuditLogsClient({ initialLogs }: { initialLogs: AuditLog[] }) {
    const columns: Column<AuditLog>[] = [
        {
            header: "Actor",
            accessorKey: "actor_user_id",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.profiles?.full_name || 'System'}</span>
                    <span className="text-xs text-muted-foreground">{row.profiles?.email}</span>
                </div>
            )
        },
        {
            header: "Role",
            accessorKey: "actor_role",
            cell: (row) => <Badge variant="outline" className="text-xs">{row.actor_role}</Badge>
        },
        {
            header: "Action",
            accessorKey: "action_type",
            cell: (row) => (
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                    {row.action_type}
                </span>
            )
        },
        {
            header: "Target",
            accessorKey: "target_type",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm capitalize">{row.target_type}</span>
                    <span className="text-xs text-muted-foreground font-mono">{row.target_id?.slice(0, 8)}</span>
                </div>
            )
        },
        {
            header: "Details",
            cell: (row) => (
                <div className="max-w-[200px] truncate text-xs text-muted-foreground" title={JSON.stringify(row.changes)}>
                    {row.changes ? JSON.stringify(row.changes) : '-'}
                </div>
            )
        },
        {
            header: "Date",
            accessorKey: "created_at",
            cell: (row) => <span className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Audit Logs"
                description="Monitor sensitive actions and system events."
            />

            <SmartTable
                data={initialLogs}
                columns={columns}
                searchKey="action_type"
                searchPlaceholder="Search by action..."
                loading={false}
                filterOptions={[
                    {
                        key: "actor_role",
                        label: "Role",
                        options: [
                            { label: "Admin", value: "sysadmin" },
                            { label: "Staff", value: "staff" },
                            { label: "Agent", value: "agent" },
                            { label: "Customer", value: "customer" }
                        ]
                    },
                    {
                        key: "target_type",
                        label: "Target",
                        options: [
                            { label: "Customer", value: "customer" },
                            { label: "Payment", value: "payment" },
                            { label: "Allocation", value: "allocation" },
                            { label: "System", value: "system" }
                        ]
                    }
                ]}
            />
        </div>
    );
}
