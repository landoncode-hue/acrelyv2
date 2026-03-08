"use client";

import { PageHeader } from "@/components/layout/page-header";
import { SmartTable, Column } from "@/components/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    User,
    Info,
    Calendar,
    Eye,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function AuditTrailClient({ initialLogs }: { initialLogs: any[] }) {
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const columns: Column<any>[] = [
        {
            header: "Time",
            cell: (row) => (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    <Calendar className="h-3 w-3" />
                    {new Date(row.created_at).toLocaleString()}
                </div>
            )
        },
        {
            header: "Actor",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/5 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-primary/70" />
                    </div>
                    <div>
                        <div className="font-semibold text-xs">{row.profiles?.full_name || 'System'}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight font-bold">{row.actor_role || 'Automation'}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Action",
            cell: (row) => (
                <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-tighter bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">
                    {row.action_type || row.action}
                </Badge>
            )
        },
        {
            header: "Target",
            cell: (row) => {
                const targetType = row.target_type || row.entity;
                const targetId = row.target_id || row.entity_id;
                return (
                    <div className="text-xs">
                        <span className="text-muted-foreground capitalize">{targetType}:</span>
                        <span className="font-mono ml-1 text-primary">{targetId?.slice(0, 8)}</span>
                    </div>
                );
            }
        },
        {
            header: "Impact",
            className: "text-right",
            cell: (row) => (
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1.5" onClick={() => setSelectedLog(row)}>
                    <Eye className="h-3 w-3" /> Inspect
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="System Audit Trail"
                description="Comprehensive immutable record of all staff actions and system events."
            />

            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <SmartTable
                    data={initialLogs}
                    columns={columns}
                    loading={false}
                    searchKey="action_type"
                    searchPlaceholder="Filter across actions..."
                    filterOptions={[
                        {
                            key: "actor_role",
                            label: "By Role",
                            options: [
                                { label: "CEO", value: "ceo" },
                                { label: "MD", value: "md" },
                                { label: "SysAdmin", value: "sysadmin" },
                                { label: "Frontdesk", value: "frontdesk" }
                            ]
                        }
                    ]}
                />
            </div>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-[750px] overflow-hidden flex flex-col max-h-[85vh]">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20">{selectedLog?.action_type || selectedLog?.action}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(selectedLog?.created_at).toLocaleString()}</span>
                        </div>
                        <DialogTitle>Audit Entry Details</DialogTitle>
                        <DialogDescription>
                            Comparing previous state and new state for target <span className="font-mono font-bold">{selectedLog?.target_id || selectedLog?.entity_id}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-[#1e1e1e] p-6 rounded-xl overflow-auto flex-1 font-mono text-[11px] leading-relaxed text-blue-300">
                        <pre>{JSON.stringify(selectedLog?.changes || selectedLog?.details, null, 2)}</pre>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t items-center">
                        <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-widest">Network Access</span>
                            <div className="text-[11px] font-mono">
                                <p>{selectedLog?.ip_address || '0.0.0.0'}</p>
                            </div>
                        </div>
                        <div className="col-span-2 text-right">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-[10px] font-medium text-muted-foreground">
                                <Info className="h-3 w-3" />
                                Immutable System Record ID: {selectedLog?.id}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
