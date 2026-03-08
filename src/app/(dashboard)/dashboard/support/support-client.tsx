"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { SmartTable, Column } from "@/components/smart-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { respondToTicketAction } from "@/lib/actions/support-actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export function SupportClient({ initialTickets }: { initialTickets: any[] }) {
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [response, setResponse] = useState("");
    const [status, setStatus] = useState("resolved");
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    const handleRespond = async () => {
        if (!selectedTicket || !response) return;

        setProcessing(true);
        const res = await respondToTicketAction(selectedTicket.id, response, status);

        if (res?.success) {
            toast.success("Response sent");
            setSelectedTicket(null);
            setResponse("");
            router.refresh();
        } else {
            const errorMsg = typeof res.error === 'string' ? res.error : "Failed to send response";
            toast.error(errorMsg);
        }
        setProcessing(false);
    };

    const columns: Column<any>[] = [
        {
            header: "User",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="font-medium">{row.profiles?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{row.profiles?.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Subject",
            accessorKey: "subject"
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={
                    row.status === 'resolved' ? 'success' :
                        row.status === 'in_progress' ? 'info' : 'secondary'
                }>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Priority",
            cell: (row) => (
                <Badge variant={row.priority === 'high' ? 'destructive' : 'outline'} className="capitalize">
                    {row.priority}
                </Badge>
            )
        },
        {
            header: "Created",
            cell: (row) => (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(row.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            header: "Action",
            className: "text-right",
            cell: (row) => (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedTicket(row); setResponse(row.admin_response || ""); setStatus(row.status); }}>
                    View & Reply
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Support Inbox"
                description="Manage and respond to customer support requests."
            />

            <SmartTable
                data={initialTickets}
                columns={columns}
                loading={false}
                searchKey="subject"
                searchPlaceholder="Search tickets..."
            />

            <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Ticket Details</DialogTitle>
                        <DialogDescription>
                            From {selectedTicket?.profiles?.full_name} on {selectedTicket && new Date(selectedTicket.created_at).toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <h4 className="font-semibold text-sm">User Message:</h4>
                            <p className="text-sm whitespace-pre-wrap">{selectedTicket?.message}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Update Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Admin Response</Label>
                                <Textarea
                                    className="min-h-[150px]"
                                    placeholder="Type your response here..."
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTicket(null)} disabled={processing}>Close</Button>
                        <Button onClick={handleRespond} disabled={processing || !response}>
                            {processing ? "Sending..." : "Send Response"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
