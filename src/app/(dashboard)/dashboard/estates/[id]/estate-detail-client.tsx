"use client";

import { useState } from "react";
import { PlotGrid } from "@/components/features/plot-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft, TrendingUp, DollarSign, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartTable, Column } from "@/components/smart-table";
import { getAvatarUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BulkCreatePlotsDialog } from "@/components/estates/bulk-create-plots-dialog";
import { EditEstateDialog } from "@/components/estates/edit-estate-dialog";
import { EstateStatusBadge } from "@/components/estates/estate-status-badge";
import { EstateInventoryBar } from "@/components/estates/estate-inventory-bar";
import { ArchiveEstateModal } from "@/components/estates/archive-estate-modal";
import { EstateActivityTimeline } from "@/components/estates/estate-activity-timeline";

interface EstateDetailClientProps {
    initialEstate: any;
    initialPlots: any[];
    initialAllocations: any[]; // Flattened allocations
    analytics: any;
    userRole?: string;
}

export default function EstateDetailClient({
    initialEstate,
    initialPlots,
    initialAllocations,
    analytics,
    userRole
}: EstateDetailClientProps) {
    const router = useRouter();
    const [estate, setEstate] = useState(initialEstate);
    const [plots, setPlots] = useState(initialPlots);
    const [filter, setFilter] = useState<'all' | 'available' | 'allocated'>('all');

    const canArchive = userRole && ['sysadmin', 'ceo', 'md'].includes(userRole);

    const refreshData = () => {
        router.refresh(); // Tells Server Component to re-fetch
    };

    const customerColumns: Column<any>[] = [
        {
            header: "Customer",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarUrl(row.customer_name)} />
                        <AvatarFallback>{row.customer_name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{row.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{row.customer_email}</p>
                    </div>
                </div>
            )
        },
        { header: "Plot", accessorKey: "plot_number" },
        { header: "Phone", accessorKey: "customer_phone" },
        {
            header: "Status",
            cell: (row) => <Badge variant={row.status === 'active' ? 'default' : 'outline'}>{row.status}</Badge>
        },
        {
            header: "Date",
            cell: (row) => new Date(row.created_at).toLocaleDateString()
        }
    ];

    if (!estate) return <div>Estate not found.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 group">
                {/* Background Image */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute top-0 right-0 p-6 z-10">
                    <EstateStatusBadge status={estate.status || "active"} className="bg-white/10 backdrop-blur-md border-white/20 text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2 text-white">
                        <div className="flex items-center gap-2 text-white/80 mb-1">
                            <Link href="/dashboard/estates" className="hover:text-white transition-colors flex items-center gap-1">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Link>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{estate.name}</h1>
                            {estate.code && (
                                <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-xs">
                                    {estate.code}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center text-white/90 gap-2">
                            <MapPin className="h-4 w-4" /> {estate.location}
                        </div>

                        <div className="flex flex-wrap gap-8 pt-4">
                            <div>
                                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Total Plots</p>
                                <p className="text-2xl font-bold">{estate.total_plots}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Available</p>
                                <p className="text-2xl font-bold text-accent">{estate.available_plots}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Price / Plot</p>
                                <p className="text-2xl font-bold">₦{estate.price.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <EditEstateDialog estate={estate} onUpdate={(updated) => { setEstate(updated); refreshData(); }} />
                        {canArchive && estate.status !== 'archived' && (
                            <ArchiveEstateModal estateId={estate.id} estateName={estate.name} />
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="plots" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                    <TabsTrigger value="plots">Plots</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                {/* Plots Tab */}
                <TabsContent value="plots" className="space-y-6">
                    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
                        <h2 className="text-xl font-bold">Master Plan Layout</h2>
                        <div className="flex gap-2">
                            <BulkCreatePlotsDialog
                                estateId={estate.id}
                                estateName={estate.name}
                                onPlotsCreated={(newPlots) => {
                                    // Optimistic update or just refresh
                                    // setPlots([...plots, ...newPlots]); // We could append, but full refresh is safer for large batches
                                    refreshData();
                                }}
                            />
                            <div className="h-9 w-px bg-border mx-2" />
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                All
                            </Button>
                            <Button
                                variant={filter === 'available' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('available')}
                            >
                                Available
                            </Button>
                            <Button
                                variant={filter === 'allocated' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('allocated')}
                            >
                                Occupied
                            </Button>
                        </div>
                    </div>

                    <div className="bg-muted/10 rounded-xl p-4 border border-dashed">
                        <PlotGrid
                            plots={plots.filter((p: any) => {
                                if (filter === 'all') return true;
                                if (filter === 'available') return p.status === 'available';
                                if (filter === 'allocated') return p.status !== 'available';
                                return true;
                            })}
                            estateId={estate.id}
                            allocations={initialAllocations}
                        />
                    </div>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Allocated Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {initialAllocations.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No allocations yet
                                </p>
                            ) : (
                                <SmartTable
                                    data={initialAllocations}
                                    columns={customerColumns}
                                    searchPlaceholder="Search customers..."
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{analytics?.total_revenue?.toLocaleString() || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics?.occupancy_percentage || 0}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {estate.total_plots - estate.available_plots} of {estate.total_plots} plots
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics?.total_customers || 0}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Plot Price</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₦{analytics?.average_plot_price?.toLocaleString() || 0}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <EstateInventoryBar
                                totalPlots={estate.total_plots}
                                availablePlots={estate.available_plots}
                                reservedPlots={analytics?.reserved_plots || 0}
                                soldPlots={analytics?.sold_plots || 0}
                                partiallyAllocatedPlots={analytics?.partially_allocated_plots || 0}
                            />
                        </CardContent>
                    </Card>

                    {analytics?.outstanding_balance > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Outstanding Balance</span>
                                    <span className="text-lg font-bold text-orange-600">
                                        ₦{analytics.outstanding_balance.toLocaleString()}
                                    </span>
                                </div>
                                {analytics.average_days_to_sell && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Avg. Days to Sell</span>
                                        <span className="text-lg font-bold">
                                            {Math.round(analytics.average_days_to_sell)} days
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                    <EstateActivityTimeline estateId={estate.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
