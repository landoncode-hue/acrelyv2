"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    exportPaymentsReportAction,
    exportAllocationsReportAction,
    exportCustomersReportAction,
    exportAgentPerformanceReportAction,
} from "@/lib/actions/export-actions";
import { exportToCSV } from "@/lib/utils/csv-utils";
import { toast } from "sonner";
import { Profile } from "@/hooks/use-profile";

type ReportType = "payments" | "allocations" | "customers" | "agent_performance";

interface ReportsViewProps {
    profile: Profile;
}

export function ReportsView({ profile }: ReportsViewProps) {
    const [reportType, setReportType] = useState<ReportType>("payments");
    const [dateFrom, setDateFrom] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [dateTo, setDateTo] = useState<Date>(new Date());
    const [rowLimit, setRowLimit] = useState<number>(1000);
    const [exporting, setExporting] = useState(false);

    async function handleExport() {
        setExporting(true);
        try {
            const dateFromStr = dateFrom.toISOString();
            const dateToStr = dateTo.toISOString();
            const filename = `${reportType}_${format(dateFrom, "yyyy-MM-dd")}_to_${format(dateTo, "yyyy-MM-dd")}.csv`;

            let response;

            switch (reportType) {
                case "payments":
                    response = await exportPaymentsReportAction(dateFromStr, dateToStr, rowLimit);
                    break;
                case "allocations":
                    response = await exportAllocationsReportAction(dateFromStr, dateToStr, rowLimit);
                    break;
                case "customers":
                    response = await exportCustomersReportAction(rowLimit);
                    break;
                case "agent_performance":
                    response = await exportAgentPerformanceReportAction(dateFromStr, dateToStr);
                    break;
            }

            if (!response?.success) {
                toast.error(`Export failed: ${response?.error?.message || "Unknown error"}`);
            } else if (response.data && response.data.length > 0) {
                exportToCSV(response.data, filename);
                toast.success(`Exported ${response.data.length} rows successfully`);
            } else {
                toast.info("No data to export for the selected criteria");
            }
        } catch (error: any) {
            console.error("Export error:", error);
            toast.error("Failed to export report");
        } finally {
            setExporting(false);
        }
    }

    // Frontdesk cannot access agent performance reports
    const canAccessAgentReports = ["sysadmin", "ceo", "md"].includes(profile.role);

    return (
        <div className="space-y-8">
            <PageHeader
                title="Reports & Export"
                description="Generate and download CSV reports"
            />

            <Card>
                <CardHeader>
                    <CardTitle>Export Configuration</CardTitle>
                    <CardDescription>Select report type and date range</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Report Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Report Type</label>
                        <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="payments">Payments Report</SelectItem>
                                <SelectItem value="allocations">Allocations Report</SelectItem>
                                <SelectItem value="customers">Customers Report</SelectItem>
                                {canAccessAgentReports && (
                                    <SelectItem value="agent_performance">Agent Performance Report</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    {reportType !== "customers" && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">From Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateFrom && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateFrom}
                                            onSelect={(date) => date && setDateFrom(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">To Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !dateTo && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dateTo}
                                            onSelect={(date) => date && setDateTo(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}

                    {/* Row Limit */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Row Limit</label>
                        <Select value={String(rowLimit)} onValueChange={(value) => setRowLimit(Number(value))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select row limit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="100">100 rows</SelectItem>
                                <SelectItem value="500">500 rows</SelectItem>
                                <SelectItem value="1000">1,000 rows</SelectItem>
                                <SelectItem value="5000">5,000 rows</SelectItem>
                                <SelectItem value="10000">10,000 rows (max)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Maximum 10,000 rows per export. For larger datasets, use date range filters.
                        </p>
                    </div>

                    {/* Export Button */}
                    <Button onClick={handleExport} disabled={exporting} className="w-full gap-2">
                        {exporting ? (
                            <>
                                <Download className="h-4 w-4 animate-pulse" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export to CSV
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Report Descriptions */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <h3 className="font-semibold text-lg">Report Contents Reference</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                    The following details lists the data columns included in each specific report type available for export.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Download className="h-4 w-4 text-muted-foreground" />
                                Payments Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p className="mb-1 font-medium text-foreground">Columns Included:</p>
                            <p>Payment ID, Date, Customer, Estate, Amount, Method, Status, Receipt Status, Recorded By</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Download className="h-4 w-4 text-muted-foreground" />
                                Allocations Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p className="mb-1 font-medium text-foreground">Columns Included:</p>
                            <p>Allocation ID, Customer, Estate, Plot, Plan Type, Total Price, Amount Paid, Outstanding Balance, Status, Agent, Dates</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Download className="h-4 w-4 text-muted-foreground" />
                                Customers Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p className="mb-1 font-medium text-foreground">Columns Included:</p>
                            <p>Customer ID, Name, Contact Info, Allocations, Total Contract Value, Amount Paid, Outstanding Balance, Status</p>
                        </CardContent>
                    </Card>

                    {canAccessAgentReports && (
                        <Card className="bg-muted/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                    Agent Performance Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                <p className="mb-1 font-medium text-foreground">Columns Included:</p>
                                <p>Agent Name, Leads, Conversions, Conversion Rate, Revenue Generated, Commission (Pending/Paid/Total)</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
