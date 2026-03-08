"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Download } from "lucide-react";
import Link from "next/link";
import { SmartTable, Column } from "@/components/smart-table";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Chip } from "@/components/ui/chip";

interface Payment {
    id: string;
    customer_name: string;
    customer_id: string;
    amount: number;
    method: string;
    reference: string;
    payment_date: string;
    status: string;
    allocation_id?: string;
    estate_name?: string;
    plot_number?: string;
}

interface PaymentClientProps {
    payments: Payment[];
    userRole: string;
}

export function PaymentClient({ payments, userRole }: PaymentClientProps) {
    const handleExportCSV = () => {
        if (!payments.length) return;

        const headers = ["Date", "Customer", "Estate", "Plot Number", "Amount", "Method", "Status"];
        const rows = payments.map(p => [
            new Date(p.payment_date).toLocaleDateString(),
            p.customer_name,
            p.estate_name || 'N/A',
            p.plot_number || 'N/A',
            p.amount,
            p.method,
            p.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success("Payments exported");
    };

    const estateOptions = Array.from(new Set(payments.map(p => p.estate_name).filter(Boolean))).map(e => ({ label: e!, value: e! }));

    const columns: Column<Payment>[] = [
        {
            header: "Date",
            cell: (row) => <span className="text-muted-foreground">{new Date(row.payment_date).toLocaleDateString()}</span>
        },
        {
            header: "Customer",
            accessorKey: "customer_name",
            cell: (row) => (
                <Link href={`/dashboard/customers/${row.customer_id}`} className="hover:underline font-medium text-primary">
                    {row.customer_name}
                </Link>
            )
        },
        {
            header: "Estate",
            accessorKey: "estate_name",
            cell: (row) => row.allocation_id ? (
                <Link href={`/dashboard/allocations/${row.allocation_id}`} className="hover:underline text-primary">
                    {row.estate_name}
                </Link>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Plot",
            cell: (row) => row.allocation_id ? (
                <Link href={`/dashboard/allocations/${row.allocation_id}`} className="hover:underline font-mono text-xs">
                    {row.plot_number}
                </Link>
            ) : <span className="text-muted-foreground">-</span>
        },
        {
            header: "Amount",
            cell: (row) => <span className="font-medium">{formatCurrency(row.amount)}</span>
        },
        {
            header: "Method",
            cell: (row) => <Chip className="capitalize font-normal text-xs">{row.method.replace('_', ' ')}</Chip>
        },
        {
            header: "Status",
            cell: (row) => (
                <Chip>
                    {row.status}
                </Chip>
            )
        },
        {
            header: "Action",
            className: "text-right",
            cell: (row) => (
                <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                    <Link href={`/dashboard/payments/${row.id}`}>View</Link>
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                title="Payments"
                description="Manage transaction history and record new payments."
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportCSV}>
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                        {['sysadmin', 'ceo', 'md'].includes(userRole) && (
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/payments/plans">
                                    <Settings className="mr-2 h-4 w-4" /> Plans
                                </Link>
                            </Button>
                        )}
                        {['sysadmin', 'ceo', 'md', 'frontdesk'].includes(userRole) && (
                            <Button asChild>
                                <Link href="/dashboard/payments/new">
                                    <Plus className="mr-2 h-4 w-4" /> Record New
                                </Link>
                            </Button>
                        )}
                    </div>
                }
            />

            <SmartTable
                data={payments}
                columns={columns}
                searchKey="customer_name"
                searchPlaceholder="Search by customer..."
                filterOptions={[
                    {
                        key: "status",
                        label: "Status",
                        options: [
                            { label: "Pending", value: "pending" },
                            { label: "Confirmed", value: "confirmed" },
                            { label: "Verified", value: "verified" },
                            { label: "Failed", value: "failed" }
                        ]
                    },
                    {
                        key: "method",
                        label: "Method",
                        options: [
                            { label: "Bank Transfer", value: "bank_transfer" },
                            { label: "Card", value: "card" },
                            { label: "Cash", value: "cash" },
                            { label: "POS", value: "pos" }
                        ]
                    },
                    {
                        key: "estate_name" as any,
                        label: "Estate",
                        options: estateOptions
                    }
                ]}
                sortOptions={[
                    { label: "Newest Date", value: "payment_date_desc" },
                    { label: "Oldest Date", value: "payment_date_asc" },
                    { label: "Highest Amount", value: "amount_desc" },
                    { label: "Lowest Amount", value: "amount_asc" }
                ]}
                defaultSort="payment_date_desc"
                onRowClick={(p) => window.location.href = `/dashboard/payments/${p.id}`}
            />
        </div>
    );
}
