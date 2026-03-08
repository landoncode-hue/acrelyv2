"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartTable, Column } from "@/components/smart-table";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { approveAgentAction, rejectAgentAction } from "@/lib/actions/agent-actions";
import { Agent } from "@/lib/repositories/types";

interface AgentWithProfile extends Agent {
    full_name: string;
    email: string;
    phone: string;
    role: string;
}

interface AgentClientProps {
    initialAgents: AgentWithProfile[];
}

export function AgentClient({ initialAgents }: AgentClientProps) {
    const router = useRouter();

    const handleApprove = async (agentId: string) => {
        try {
            const result = await approveAgentAction({ agentId });
            if (result?.success) {
                toast.success("Agent approved successfully");
            } else {
                throw new Error(typeof result?.error === 'string' ? result.error : result?.error?.message || "Failed to approve agent");
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to approve agent");
        }
    };

    const handleReject = async (agentId: string) => {
        try {
            const result = await rejectAgentAction({ agentId });
            if (result?.success) {
                toast.success("Agent rejected");
            } else {
                throw new Error(typeof result?.error === 'string' ? result.error : result?.error?.message || "Failed to reject agent");
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to reject agent");
        }
    };

    const columns: Column<AgentWithProfile>[] = [
        {
            header: "Name",
            cell: (row) => (
                <div>
                    <div className="font-medium">{row.full_name}</div>
                    <div className="text-xs text-muted-foreground">{row.email}</div>
                </div>
            )
        },
        { header: "Phone", cell: (row) => row.phone },
        {
            header: "Commission",
            cell: (row) => row.commission_rate + "%"
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : row.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Action",
            className: "text-right",
            cell: (row) => (
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => router.push(`/dashboard/agents/${row.id}`)} data-testid="view-agent-btn">
                        <Eye className="h-4 w-4" />
                    </Button>
                    {row.status === 'pending' && (
                        <>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700" onClick={() => handleReject(row.id)}>
                                <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="success" className="h-8 w-8 p-0" onClick={() => handleApprove(row.id)}>
                                <Check className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <SmartTable
            data={initialAgents}
            columns={columns}
            searchKey="full_name"
            searchPlaceholder="Search agents..."
            onRowClick={(row) => router.push(`/dashboard/agents/${row.id}`)}
            filterOptions={[
                {
                    key: "status",
                    label: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Pending", value: "pending" },
                        { label: "Suspended", value: "suspended" },
                        { label: "Rejected", value: "rejected" }
                    ]
                }
            ]}
        />
    );
}
