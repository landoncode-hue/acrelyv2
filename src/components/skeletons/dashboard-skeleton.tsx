
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                            <Skeleton className="h-8 w-[120px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[250px] w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
