import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, AlertTriangle, Clock, TrendingUp, Layers, MessageSquare } from "lucide-react";
import Link from "next/link";
import { DeliveryChart } from "./components/DeliveryChart";
import { TermiiBalanceCard } from "./components/TermiiBalanceCard";
import { getTermiiBalance } from "@/lib/termii";
import { CommunicationService } from "@/lib/services/CommunicationService";

export const metadata = {
    title: "Communications Dashboard",
};

export const revalidate = 0; // Ensure fresh data on navigation

const communicationService = new CommunicationService();

export default async function CommunicationOverviewPage() {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const isoSevenDaysAgo = sevenDaysAgo.toISOString().split('T')[0];

    // Parallelize all data fetching
    const [metrics, logs, termiiRes] = await Promise.all([
        communicationService.getCommunicationMetrics(today),
        communicationService.getCommunicationLogs(`${isoSevenDaysAgo}T00:00:00`, `${today}T23:59:59`),
        getTermiiBalance()
    ]);

    // Process chart data
    const daysMap = new Map();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateKey = d.toISOString().split('T')[0];
        daysMap.set(dateKey, { name: dayName, sms: 0, email: 0 });
    }

    logs.forEach(log => {
        const dateKey = new Date(log.sent_at).toISOString().split('T')[0];
        if (daysMap.has(dateKey)) {
            const dayStats = daysMap.get(dateKey);
            if (log.channel === 'sms') dayStats.sms++;
            else if (log.channel === 'email') dayStats.email++;
        }
    });
    const chartData = Array.from(daysMap.values());

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messages Sent Today</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.sentToday}</div>
                        <p className="text-xs text-muted-foreground">Across all channels</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{metrics.failedToday}</div>
                        <p className="text-xs text-muted-foreground">Check logs for details</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled Queue</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.scheduled}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.retrying > 0 ? (
                                <span className="text-orange-600 font-medium">{metrics.retrying} retrying due to failure</span>
                            ) : (
                                "Upcoming in next 24h"
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Customers</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.uniqueOverdueCustomers}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Delivery Chart */}
                <DeliveryChart data={chartData} />

                {/* Side Widgets */}
                <div className="col-span-3 space-y-4">
                    {/* Termii Balance */}
                    <TermiiBalanceCard initialBalance={termiiRes.balance} />

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <Link href="/dashboard/communications/campaigns" className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all hover:shadow-sm">
                                <div className="p-2.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Send className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-sm">Send New Broadcast</span>
                            </Link>

                            <Link href="/dashboard/communications/templates" className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all hover:shadow-sm">
                                <div className="p-2.5 rounded-md bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <Layers className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-sm">Manage Templates</span>
                            </Link>

                            <Link href="/dashboard/communications/logs" className="group flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all hover:shadow-sm">
                                <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-sm">View Full Logs</span>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
