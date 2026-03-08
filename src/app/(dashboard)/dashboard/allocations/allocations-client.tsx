"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SmartTable, Column } from "@/components/smart-table";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusChip } from "@/components/ui/status-chip";

interface Allocation {
    id: string;
    customer_name: string;
    estate_name: string;
    plot_number: string;
    status: string;
    allocation_date: string;
}

interface AllocationsClientProps {
    initialAllocations: Allocation[];
}

export default function AllocationsClient({ initialAllocations }: AllocationsClientProps) {
    const router = useRouter();

    const columns: Column<Allocation>[] = [
        { header: "Customer", accessorKey: "customer_name" },
        { header: "Estate", accessorKey: "estate_name" },
        { header: "Plot", accessorKey: "plot_number" },
        {
            header: "Status",
            cell: (row) => (
                <StatusChip status={row.status} />
            )
        },
        {
            header: "Date",
            cell: (row) => new Date(row.allocation_date).toLocaleDateString()
        },
        {
            header: "Action",
            className: "text-right",
            cell: (c) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/allocations/${c.id}`}>View</Link>
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Allocations"
                description="Manage property allocations"
                actions={
                    <Button asChild>
                        <Link href="/dashboard/allocations/new">
                            <Plus className="mr-2 h-4 w-4" /> New Allocation
                        </Link>
                    </Button>
                }
            />

            <SmartTable
                data={initialAllocations}
                columns={columns}
                searchKey="customer_name"
                searchPlaceholder="Search by customer..."
                filterOptions={[
                    {
                        key: "estate_name",
                        label: "Estate",
                        options: Array.from(new Set(initialAllocations.map(a => a.estate_name))).sort().map(name => ({
                            label: name,
                            value: name
                        }))
                    },
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { label: "Draft", value: "draft" },
                            { label: "Active", value: "active" },
                            { label: "Approved", value: "approved" },
                            { label: "Completed", value: "completed" },
                            { label: "Revoked", value: "revoked" }
                        ]
                    }
                ]}
                sortOptions={[
                    { label: "Newest Created", value: "created_at_desc" },
                    { label: "Oldest Created", value: "created_at_asc" },
                    { label: "Customer A-Z", value: "customer_name_asc" },
                    { label: "Customer Z-A", value: "customer_name_desc" }
                ]}
                defaultSort="created_at_desc"
                onRowClick={(item) => router.push(`/dashboard/allocations/${item.id}`)}
            />
        </div>
    );
}
