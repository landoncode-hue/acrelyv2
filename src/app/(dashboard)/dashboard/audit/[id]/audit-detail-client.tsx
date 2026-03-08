"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Simplified version of formatAuditAction since the original relies on utils that might be client/server specific
const formatAuditAction = (log: any) => {
    if (!log) return "Unknown Action";
    const action = log.action_type || log.action || "Unknown Action";
    const target = log.target_type || log.entity || "entity";
    return `${action} on ${target}`;
};

export default function AuditLogDetailClient({ log }: { log: any }) {
    const router = useRouter();

    if (!log) return <div>Log entry not found</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Logs
            </Button>

            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold font-mono uppercase tracking-tight">{formatAuditAction(log)}</h1>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <span className="font-medium text-primary">{log.actor?.full_name || "System"}</span>
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Change Impact</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-muted/40 rounded border">
                            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest">Target</h4>
                            <p className="font-mono text-sm">{log.target_type || log.entity} / {log.target_id || log.entity_id}</p>
                        </div>
                        <div className="p-4 bg-muted/40 rounded border">
                            <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-widest">Actor Role</h4>
                            <Badge variant="outline" className="uppercase tracking-widest text-[10px]">{log.actor_role || "Automation"}</Badge>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold mb-3 uppercase tracking-widest text-muted-foreground">Payload</h3>
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-xs font-mono leading-relaxed text-blue-300">
                            {JSON.stringify(log.changes || log.details, null, 2)}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
