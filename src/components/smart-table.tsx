"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, LucideIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string; // For alignment like "text-right"
}

interface SmartTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchKey?: keyof T;
    searchPlaceholder?: string;
    sortOptions?: { label: string; value: string }[];
    defaultSort?: string;
    filterOptions?: {
        key: keyof T;
        label: string;
        options: { label: string; value: string }[];
    }[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
    emptyState?: {
        title: string;
        description: string;
        icon?: LucideIcon;
        actionLabel?: string;
        actionHref?: string;
        onAction?: () => void;
    };
    /** Render cards instead of table rows on mobile */
    mobileCardRender?: (item: T) => React.ReactNode;
}

export function SmartTable<T extends { id: string | number }>({
    data,
    columns,
    searchKey,
    searchPlaceholder = "Search...",
    filterOptions = [],
    sortOptions = [],
    defaultSort,
    loading = false,
    onRowClick,
    emptyState,
    mobileCardRender,
}: SmartTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [currentSort, setCurrentSort] = useState(defaultSort || (sortOptions.length > 0 ? sortOptions[0].value : ""));
    const [filtersOpen, setFiltersOpen] = useState(false);
    const itemsPerPage = 10;

    // Count active filters
    const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

    // Filter Logic
    const processedData = useMemo(() => {
        let result = data.filter((item) => {
            // 1. Search
            if (searchKey && searchQuery) {
                const value = String(item[searchKey]).toLowerCase();
                if (!value.includes(searchQuery.toLowerCase())) return false;
            }

            // 2. Filters
            for (const filter of filterOptions) {
                const selectedValue = filters[filter.key as string];
                if (selectedValue && selectedValue !== "all") {
                    if (!String(item[filter.key]).includes(selectedValue)) return false;
                }
            }

            return true;
        });

        // 3. Sort Logic
        if (currentSort) {
            result = [...result].sort((a, b) => {
                const lastUnderscoreIndex = currentSort.lastIndexOf('_');
                const field = currentSort.substring(0, lastUnderscoreIndex);
                const direction = currentSort.substring(lastUnderscoreIndex + 1);
                const dir = direction === 'asc' ? 1 : -1;

                const valA = a[field as keyof T];
                const valB = b[field as keyof T];

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return valA.localeCompare(valB) * dir;
                }
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return (valA - valB) * dir;
                }
                // Fallback
                return 0;
            });
        }
        return result;
    }, [data, searchQuery, filters, currentSort, searchKey, filterOptions]);

    // Pagination Logic
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage);

    // Reset page when search/filter changes
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                    {searchKey && (
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-8"
                            />
                        </div>
                    )}

                    {/* Mobile Filter Button */}
                    {filterOptions.length > 0 && (
                        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="sm:hidden flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-4 py-4">
                                    {filterOptions.map((filter) => (
                                        <div key={String(filter.key)} className="space-y-2">
                                            <label className="text-sm font-medium">{filter.label}</label>
                                            <Select
                                                value={filters[filter.key as string] || "all"}
                                                onValueChange={(v) => {
                                                    setFilters((prev) => ({ ...prev, [filter.key as string]: v }));
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={filter.label} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All {filter.label}</SelectItem>
                                                    {filter.options.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ))}
                                    {sortOptions.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Sort By</label>
                                            <Select
                                                value={currentSort}
                                                onValueChange={(v) => {
                                                    setCurrentSort(v);
                                                    setCurrentPage(1);
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Sort By" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sortOptions.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <Button
                                        className="w-full mt-4"
                                        onClick={() => setFiltersOpen(false)}
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}

                    {/* Desktop Filters */}
                    <div className="hidden sm:flex items-center gap-2">
                        {filterOptions.map((filter) => (
                            <Select
                                key={String(filter.key)}
                                value={filters[filter.key as string] || "all"}
                                onValueChange={(v) => {
                                    setFilters((prev) => ({ ...prev, [filter.key as string]: v }));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-2 w-full">
                                        <SlidersHorizontal className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate text-left block w-full">
                                            <SelectValue placeholder={filter.label} />
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All {filter.label}</SelectItem>
                                    {filter.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}

                        {sortOptions.length > 0 && (
                            <Select
                                value={currentSort}
                                onValueChange={(v) => {
                                    setCurrentSort(v);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-2 w-full">
                                        <SlidersHorizontal className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate text-left block w-full">
                                            <SelectValue placeholder="Sort By" />
                                        </span>
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
                {!loading && (
                    <div className="text-sm text-muted-foreground">
                        Showing {processedData.length} records
                    </div>
                )}
            </div>


            {/* Mobile Card Layout */}
            {mobileCardRender && (
                <div className="sm:hidden space-y-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg bg-card">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2 mb-3" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                        ))
                    ) : paginatedData.length > 0 ? (
                        paginatedData.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onRowClick && onRowClick(item)}
                                className={onRowClick ? "cursor-pointer" : ""}
                            >
                                {mobileCardRender(item)}
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            title={emptyState?.title || "No records found"}
                            description={emptyState?.description || "No data available."}
                            icon={emptyState?.icon || Search}
                            actionLabel={emptyState?.actionLabel}
                            actionHref={emptyState?.actionHref}
                            onAction={emptyState?.onAction}
                            className="py-8"
                        />
                    )}
                </div>
            )}

            {/* Desktop Table */}
            <div className={mobileCardRender ? "hidden sm:block rounded-md border bg-card overflow-hidden" : "rounded-md border bg-card overflow-hidden"}>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            {columns.map((col, i) => (
                                <TableHead key={i} className={col.className}>
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <TableRow
                                    key={item.id}
                                    data-testid="table-row"
                                    data-row-id={item.id}
                                    tabIndex={onRowClick ? 0 : undefined}
                                    className={onRowClick ? "cursor-pointer hover:bg-muted/50 focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20" : ""}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    onKeyDown={(e) => {
                                        if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault();
                                            onRowClick(item);
                                        }
                                    }}
                                >
                                    {columns.map((col, i) => (
                                        <TableCell key={i} className={col.className}>
                                            {col.cell
                                                ? col.cell(item)
                                                : (item[col.accessorKey!] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-64 text-center text-muted-foreground"
                                >
                                    {processedData.length === 0 && data.length > 0 ? (
                                        <div className="flex flex-col items-center justify-center p-8">
                                            <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                            <p className="font-medium">No matches found</p>
                                            <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            title={emptyState?.title || "No records found"}
                                            description={emptyState?.description || "No data available at the moment."}
                                            icon={emptyState?.icon || Search}
                                            actionLabel={emptyState?.actionLabel}
                                            actionHref={emptyState?.actionHref}
                                            onAction={emptyState?.onAction}
                                            className="py-12"
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
