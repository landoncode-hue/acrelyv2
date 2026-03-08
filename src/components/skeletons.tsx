import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number, columns?: number }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRow key={i}>
                            {Array.from({ length: columns }).map((_, j) => (
                                <TableCell key={j}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function MetricCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[140px]" />
            </CardContent>
        </Card>
    )
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <Skeleton className="h-10 w-full mt-6" />
        </div>
    )
}

export function DetailPageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-10 w-[120px]" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
    )
}
