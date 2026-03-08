"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RefreshCw, AlertCircle, CheckCircle2, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

type Log = {
    id: string;
    channel: 'sms' | 'email' | 'whatsapp' | 'in-app';
    type: string;
    message: string;
    status: 'delivered' | 'failed' | 'pending';
    sent_at: string;
    meta: any;
    failure_reason?: string;
    related_entity_type?: string;
    dlr_status?: string;
    dlr_received_at?: string;
    provider_message_id?: string;
    campaign_id?: string;
};

export default function CommunicationLogsClient({ logs }: { logs: Log[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const statusFilter = searchParams.get("status") || "all";
    const channelFilter = searchParams.get("channel") || "all";

    const setFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === "all") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    const getStatusBadge = (log: Log) => {
        const { status, failure_reason, dlr_status, meta } = log;
        const reason = failure_reason || (meta as any)?.error;

        // Show DLR status if available for SMS
        if (dlr_status && log.channel === 'sms') {
            if (dlr_status === 'Delivered') {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered (DLR)
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Carrier confirmed delivery</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
            if (['Failed', 'Rejected', 'Expired'].includes(dlr_status)) {
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="destructive" className="items-center flex">
                                    <AlertCircle className="w-3 h-3 mr-1" /> {dlr_status}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Carrier reported: {dlr_status}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            }
        }

        if (status === 'delivered') return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Delivered</Badge>;
        if (status === 'pending') return <Badge variant="secondary"><Timer className="w-3 h-3 mr-1" /> Pending</Badge>;
        if (status === 'failed') {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Badge variant="destructive" className="items-center flex">
                                <AlertCircle className="w-3 h-3 mr-1" /> Failed
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{reason || "Unknown error"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }
        return <Badge variant="outline">{status}</Badge>;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input placeholder="Search messages (coming soon)..." className="w-[300px]" disabled />
                    <Select value={channelFilter} onValueChange={(val) => setFilter("channel", val)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Channel" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Channels</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="in-app">In-App</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(val) => setFilter("status", val)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" onClick={handleRefresh} size="icon" disabled={isPending}>
                    <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                            <TableHead>Channel</TableHead>
                            <TableHead>Context</TableHead>
                            <TableHead className="max-w-[400px]">Message</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {format(new Date(log.sent_at), "MMM d, h:mm:ss a")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {log.channel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span className="font-medium capitalize">{log.type}</span>
                                            {log.related_entity_type && (
                                                <span className="text-muted-foreground capitalize">
                                                    Ref: {log.related_entity_type}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[400px]">
                                        <p className="truncate text-sm" title={log.message}>{log.message}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span className="font-medium">{log.meta?.customer_name || 'N/A'}</span>
                                            <span className="text-muted-foreground">{log.meta?.recipient || log.meta?.email || log.meta?.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {getStatusBadge(log)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-xs text-muted-foreground text-center">
                Query limited to last 100 logs.
            </div>
        </div>
    );
}
