"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { SmartTable, Column } from "@/components/smart-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { KYCStatusBadge } from "@/components/customers/KYCStatusManager";
import { StatusChip } from "@/components/ui/status-chip";
import { PageHeader } from "@/components/layout/page-header";

export interface CustomerWithMetrics {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    status: string;
    kyc_status: string;
    created_at: string;
    avatar_url?: string;
    estates?: string;
    total_properties: number;
    total_paid: number;
    outstanding_balance: number;
    has_overdue: boolean;
}

interface CustomersTableProps {
    initialCustomers: CustomerWithMetrics[];
}

export default function CustomersTable({ initialCustomers }: CustomersTableProps) {
    const [customers] = useState<CustomerWithMetrics[]>(initialCustomers);
    const router = useRouter();

    const estateOptions = useMemo(() => {
        const uniqueEstates = new Set<string>();
        customers.forEach((c) => {
            if (c.estates) {
                c.estates.split(", ").forEach((e: string) => uniqueEstates.add(e));
            }
        });
        return Array.from(uniqueEstates).map(e => ({ label: e, value: e }));
    }, [customers]);

    const columns: Column<CustomerWithMetrics>[] = [
        {
            header: "Name",
            cell: (c) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(c.full_name, c.avatar_url)} />
                        <AvatarFallback>{c.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{c.full_name}</span>
                        {c.has_overdue && (
                            <Badge variant="destructive" className="text-[10px] w-fit px-1 py-0">
                                Overdue
                            </Badge>
                        )}
                    </div>
                </div>
            )
        },
        { header: "Phone", accessorKey: "phone" },
        {
            header: "Properties",
            cell: (c) => (
                <span className="font-medium">{c.total_properties}</span>
            ),
            accessorKey: "total_properties"
        },
        {
            header: "Total Paid",
            cell: (c) => (
                <span className="font-medium text-green-600">
                    ₦{c.total_paid.toLocaleString()}
                </span>
            ),
            accessorKey: "total_paid"
        },
        {
            header: "Outstanding",
            cell: (c) => (
                <span className={`font-medium ${c.outstanding_balance > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                    ₦{c.outstanding_balance.toLocaleString()}
                </span>
            ),
            accessorKey: "outstanding_balance"
        },
        {
            header: "KYC Status",
            cell: (c) => <KYCStatusBadge status={c.kyc_status} />,
            accessorKey: "kyc_status"
        },
        {
            header: "Status",
            cell: (c) => (
                <StatusChip status={c.status || 'active'} />
            ),
            accessorKey: "status"
        },
        {
            header: "Joined",
            cell: (c) => new Date(c.created_at).toLocaleDateString(),
            accessorKey: "created_at"
        },
        {
            header: "Action",
            className: "text-right",
            cell: (c) => (
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/customers/${c.id}`}>View</Link>
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Customers"
                description="Manage customer profiles and history"
                actions={
                    <Button asChild>
                        <Link href="/dashboard/customers/new">
                            <Plus className="mr-2 h-4 w-4" /> Add Customer
                        </Link>
                    </Button>
                }
            />

            <SmartTable
                data={customers}
                columns={columns}
                searchKey="full_name"
                searchPlaceholder="Search customers..."
                filterOptions={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Archived", value: "archived" }
                        ]
                    },
                    {
                        key: "kyc_status",
                        label: "KYC Status",
                        options: [
                            { label: "Not Started", value: "not_started" },
                            { label: "Pending", value: "pending" },
                            { label: "Verified", value: "verified" },
                            { label: "Rejected", value: "rejected" }
                        ]
                    },
                    {
                        key: "has_overdue",
                        label: "Payment Status",
                        options: [
                            { label: "Has Overdue", value: "true" },
                            { label: "No Overdue", value: "false" }
                        ]
                    },
                    {
                        key: "estates" as any,
                        label: "Estate",
                        options: estateOptions
                    }
                ]}
                sortOptions={[
                    { label: "Overdue First", value: "has_overdue_desc" },
                    { label: "Newest Joined (Default)", value: "created_at_desc" },
                    { label: "Oldest Joined", value: "created_at_asc" },
                    { label: "Name A-Z", value: "full_name_asc" },
                    { label: "Name Z-A", value: "full_name_desc" },
                    { label: "Highest Paid", value: "total_paid_desc" },
                    { label: "Highest Outstanding", value: "outstanding_balance_desc" }
                ]}
                defaultSort="created_at_desc"
                onRowClick={(c) => router.push(`/dashboard/customers/${c.id}`)}
            />
        </div>
    );
}
