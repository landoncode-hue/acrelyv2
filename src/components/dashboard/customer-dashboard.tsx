"use client";

import { useEffect, useState } from "react";
import { CustomerFinancialSummary } from "@/components/customers/CustomerFinancialSummary";
import {
    Home,
    ArrowRight,
    Download,
    CreditCard,
    FileText,
    HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomerDashboard({ profile }: { profile: any }) {
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState<any>(null);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [recentPayments, setRecentPayments] = useState<any[]>([]);

    useEffect(() => {
        async function loadCustomerData() {
            setLoading(false);
        }

        if (profile) loadCustomerData();
    }, [profile]);

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <h3 className="font-semibold">Customer Profile Not Found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-2">
                        We couldn't find your customer profile. Please contact support for assistance.
                    </p>
                    <Button variant="outline" className="mt-6" asChild>
                        <Link href="/portal/help">Contact Support</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Hero */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Welcome back, {customer.full_name.split(' ')[0]}
                    </h2>
                    <p className="text-muted-foreground">
                        Here's an overview of your real estate portfolio.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/portal/payments">
                            <CreditCard className="mr-2 h-4 w-4" />
                            View Payments
                        </Link>
                    </Button>
                    <Button asChild className="bg-brand-primary">
                        <Link href="/portal/help">Contact Support</Link>
                    </Button>
                </div>
            </div>

            {/* Financial Summary Cards */}
            <CustomerFinancialSummary customerId={customer.id} />

            {/* Properties List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Properties</h3>
                    <Link href="/portal/properties" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {allocations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allocations.slice(0, 6).map((allocation) => {
                            // Determine plot display info
                            const allocPlots = allocation.allocation_plots || [];
                            const hasMultiplePlots = allocPlots.length > 1;
                            const plotNumbers = allocPlots.length > 0
                                ? allocPlots.map((ap: any) => ap.plots?.plot_number || 'N/A')
                                : allocation.plots?.plot_number ? [allocation.plots.plot_number] : ['TBD'];

                            return (
                                <Card key={allocation.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                                    <div className="h-40 bg-muted relative">
                                        {allocation.estates?.image_urls?.[0] ? (
                                            <img
                                                src={allocation.estates.image_urls[0]}
                                                alt={allocation.estates.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/20 to-brand-pink/20">
                                                <Home className="h-10 w-10 text-brand-purple/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            {hasMultiplePlots && (
                                                <Badge variant="secondary" className="bg-green-100/90 text-green-800 text-xs">
                                                    {plotNumbers.length} Plots
                                                </Badge>
                                            )}
                                            <Badge
                                                variant={allocation.status === 'approved' ? 'success' : 'secondary'}
                                                className="bg-white/90 text-black hover:bg-white"
                                            >
                                                {allocation.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4 space-y-3">
                                        <div>
                                            <h4 className="font-semibold truncate">{allocation.estates?.name || 'Unknown Estate'}</h4>
                                            <p className="text-xs text-muted-foreground truncate">{allocation.estates?.location}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-sm pt-2 border-t border-dashed">
                                            <span className="text-muted-foreground">
                                                {hasMultiplePlots ? 'Plots' : 'Plot Number'}
                                            </span>
                                            <span className="font-medium">
                                                {hasMultiplePlots
                                                    ? plotNumbers.map((p: string) => `#${p}`).join(', ')
                                                    : `#${plotNumbers[0]}`
                                                }
                                            </span>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                            <Link href={`/portal/properties/${allocation.id}`}>View Details</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                            <Home className="h-12 w-12 text-muted-foreground/20 mb-4" />
                            <h3 className="font-semibold">No properties yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                You don't have any active properties. Contact our sales team to find your perfect property.
                            </p>
                            <Button variant="outline" className="mt-6" asChild>
                                <Link href="/portal/help">Contact Sales</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recent Payments */}
            {recentPayments.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Recent Payments</h3>
                        <Link href="/portal/payments" className="text-sm text-primary hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recentPayments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-2 rounded-full">
                                                <CreditCard className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">₦{payment.amount.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(payment.payment_date).toLocaleDateString()} • {payment.method?.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="success" className="text-xs">Confirmed</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Links / Support */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-lg">Need Help?</CardTitle>
                        <CardDescription>Our support team is available to assist you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Button variant="default" asChild>
                                <Link href="/portal/help">Contact Support</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/portal/help">View FAQs</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Your Documents</CardTitle>
                        <CardDescription>Access your receipts and agreements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/portal/payments">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Payment Receipts
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href="/portal/properties">
                                    <Download className="mr-2 h-4 w-4" />
                                    Property Documents
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
