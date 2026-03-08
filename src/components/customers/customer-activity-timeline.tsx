"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, User, FileText, CreditCard, Home, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
    id: string;
    action_type: string;
    actor_role: string;
    actor_user_id: string; // uuid
    target_id: string;
    target_type: string;
    changes: any;
    created_at: string;
    profiles?: { full_name: string }; // joined
}

interface CustomerActivityTimelineProps {
    customerId: string;
}

export function CustomerActivityTimeline({ customerId }: CustomerActivityTimelineProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            // Fetch logs where target_id is the customer OR target_type includes 'customer'
            // We also want to fetch logs for their allocations/payments if possible, but that might be complex
            // For now, let's stick to direct customer actions and maybe expanding if we have the IDs.
            // Actually, best practice is to have the backend log "customer" as entityType or target_id for all related actions, 
            // OR we just query by target_id = customer_id. 
            // Many system actions (like 'record_payment') might log the payment ID as target. 
            // So we might miss those unless we search by metadata/changes containing customer_id.

            setLoading(false);
        }
        fetchLogs();
    }, [customerId]);

    const getIcon = (action: string) => {
        if (action.includes('payment')) return CreditCard;
        if (action.includes('allocation') || action.includes('plot')) return Home;
        if (action.includes('note') || action.includes('interaction')) return FileText;
        if (action.includes('settings') || action.includes('update')) return Settings;
        return User;
    };

    const formatAction = (action: string) => {
        return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    if (logs.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/20">
                <p>No system activity recorded yet.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6 pl-2">
                {logs.map((log, index) => {
                    const Icon = getIcon(log.action_type);
                    return (
                        <div key={log.id} className="relative flex gap-4 pb-6 last:pb-0">
                            {/* Vertical Line */}
                            {index !== logs.length - 1 && (
                                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                            )}

                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 pt-1">
                                <div className="flex items-center justify-between gap-x-4">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-foreground">
                                            {formatAction(log.action_type)}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            by {log.profiles?.full_name || 'System'}
                                        </span>
                                    </div>
                                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </time>
                                </div>

                                <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded border font-mono">
                                    {log.changes ? JSON.stringify(log.changes, null, 2).slice(0, 150) + (JSON.stringify(log.changes).length > 150 ? '...' : '') : 'No details'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
