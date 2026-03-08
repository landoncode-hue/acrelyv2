import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartTable, Column } from "@/components/smart-table";
import Link from "next/link";
import { Eye, MapPin } from "lucide-react";
// Define Estate type since it's missing from import
export interface Estate {
    id: string;
    name: string;
    location: string;
    total_plots?: number;
    occupied_plots?: number;
    available_plots?: number;
    price?: number;
    status: string;
    created_at?: string;
}

interface EstateListViewProps {
    estates: Estate[];
    loading: boolean;
}

export function EstateListView({ estates, loading }: EstateListViewProps) {
    const columns: Column<Estate>[] = [
        {
            header: "Estate Name",
            cell: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {row.location}
                    </div>
                </div>
            )
        },
        {
            header: "Total Plots",
            cell: (row) => <span className="text-sm font-medium">{row.total_plots || 0}</span>,
            accessorKey: "total_plots"
        },
        {
            header: "Sold",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{row.occupied_plots || 0}</span>
                    <span className="text-xs text-muted-foreground">
                        ({row.total_plots ? Math.round(((row.occupied_plots || 0) / row.total_plots) * 100) : 0}%)
                    </span>
                </div>
            )
        },
        {
            header: "Available",
            cell: (row) => (
                <span className={`text-sm font-medium ${(row.available_plots || 0) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {row.available_plots || 0}
                </span>
            )
        },
        {
            header: "Price Range",
            cell: (row) => (
                <div className="text-sm">
                    {formatCurrency(row.price || 0)}
                    <span className="text-xs text-muted-foreground ml-1">/ plot</span>
                </div>
            )
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={row.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Action",
            className: "text-right",
            cell: (row) => (
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/estates/${row.id}`}>
                            <Eye className="h-4 w-4 mr-2" /> View
                        </Link>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <SmartTable
            data={estates}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search estates..."
            loading={loading}
            sortOptions={[
                { label: "Newest First", value: "created_at_desc" },
                { label: "Name A-Z", value: "name_asc" },
                { label: "Highest Price", value: "price_desc" },
                { label: "Most Available", value: "available_plots_desc" }
            ]}
            filterOptions={[
                {
                    key: "status",
                    label: "Status",
                    options: [
                        { label: "Active", value: "active" },
                        { label: "Sold Out", value: "sold_out" },
                        { label: "Development", value: "development" }
                    ]
                }
            ]}
        />
    );
}
