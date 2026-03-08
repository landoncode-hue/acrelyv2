"use client";

import { useEffect, useState, useCallback } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Plus, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { SmartTable, Column } from "@/components/smart-table";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { LeadSourceBadge } from "@/components/leads/LeadSourceBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { deleteLeadAction, updateLeadAction } from "@/lib/actions/leads-actions";
import { Lead, LeadStatus } from "@/lib/repositories/types";



interface LeadsClientProps {
    initialLeads: Lead[];
}

export default function LeadsClient({ initialLeads }: LeadsClientProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [loading, setLoading] = useState(false); // No initial loading needed
    const { profile } = useProfile();
    const router = useRouter();

    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;

        try {
            const result = await deleteLeadAction(id);
            if (result?.success) {
                toast.success("Lead deleted");
                // Optimistic update or wait for router refresh
                // router.refresh(); // Server action already revalidates
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to delete lead";
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            toast.error("Failed to delete lead: " + error.message);
        }
    };

    const handleMarkContacted = async (id: string) => {
        try {
            const result = await updateLeadAction({
                id,
                last_contacted_at: new Date().toISOString(),
                status: "contacted"
            });

            if (result?.success) {
                toast.success("Lead marked as contacted");
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to update lead";
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            toast.error("Failed to update lead: " + error.message);
        }
    };

    const columns: Column<Lead>[] = [
        {
            header: "Name",
            accessorKey: "full_name",
            cell: (row) => (
                <div className="font-medium">{row.full_name}</div>
            )
        },
        {
            header: "Phone",
            accessorKey: "phone",
            cell: (row) => (
                <div className="font-mono text-sm">{row.phone}</div>
            )
        },
        {
            header: "Source",
            accessorKey: "source",
            cell: (row) => <LeadSourceBadge source={row.source} />
        },
        {
            header: "Interest",
            accessorKey: "interest",
            cell: (row) => <Badge variant="outline">{row.interest}</Badge>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row) => <LeadStatusBadge status={row.status} />
        },
        {
            header: "Assigned To",
            cell: (row) => {
                if (!row.assigned_to) return <span className="text-muted-foreground text-sm">Unassigned</span>;

                const agentProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
                const agentName = agentProfile?.full_name || "Unknown";

                return (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                                {agentName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{agentName}</span>
                    </div>
                );
            }
        },
        {
            header: "Next Follow-up",
            cell: (row) => {
                if (!row.next_follow_up_at) {
                    return <span className="text-muted-foreground text-sm">Not set</span>;
                }

                const followUpDate = new Date(row.next_follow_up_at);
                const isOverdue = followUpDate < new Date() && !['converted', 'lost'].includes(row.status);

                return (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={isOverdue ? "destructive" : "outline"}
                            className={isOverdue ? "animate-pulse" : ""}
                        >
                            {formatDistanceToNow(followUpDate, { addSuffix: true })}
                        </Badge>
                    </div>
                );
            }
        },
        {
            header: "Age",
            cell: (row) => (
                <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(row.created_at), { addSuffix: false })}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (lead) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/leads/${lead.id}`)}>
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`)}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                        </DropdownMenuItem>
                        {lead.status === 'new' && (
                            <DropdownMenuItem onClick={() => handleMarkContacted(lead.id)}>
                                Mark as Contacted
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(lead.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    // Get unique sources and statuses for filters
    const uniqueSources = Array.from(new Set(leads.map(l => l.source))).filter((s): s is string => Boolean(s)).map(s => ({ label: s, value: s }));
    const uniqueInterests = Array.from(new Set(leads.map(l => l.interest))).filter((i): i is string => Boolean(i)).map(i => ({ label: i, value: i }));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Leads Pipeline"
                description="Manage and track potential customers through the sales funnel."
                actions={
                    <Button asChild>
                        <Link href="/dashboard/leads/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Lead
                        </Link>
                    </Button>
                }
            />

            <SmartTable
                data={leads}
                columns={columns}
                searchKey="full_name"
                searchPlaceholder="Search leads..."
                loading={loading}
                filterOptions={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { label: "New", value: "new" },
                            { label: "Contacted", value: "contacted" },
                            { label: "Qualified", value: "qualified" },
                            { label: "Converted", value: "converted" },
                            { label: "Lost", value: "lost" }
                        ]
                    },
                    {
                        key: "source",
                        label: "Source",
                        options: uniqueSources
                    },
                    {
                        key: "interest",
                        label: "Interest",
                        options: uniqueInterests
                    }
                ]}
                sortOptions={[
                    { label: "Follow-up (Soonest)", value: "next_follow_up_at_asc" },
                    { label: "Follow-up (Latest)", value: "next_follow_up_at_desc" },
                    { label: "Newest First", value: "created_at_desc" },
                    { label: "Oldest First", value: "created_at_asc" },
                    { label: "Name A-Z", value: "full_name_asc" },
                    { label: "Name Z-A", value: "full_name_desc" }
                ]}
                defaultSort="next_follow_up_at_asc"
                onRowClick={(l) => router.push(`/dashboard/leads/${l.id}`)}
            />
        </div>
    );
}
