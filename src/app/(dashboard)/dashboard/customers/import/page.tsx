"use client";

import { useState } from "react";
import { bulkImportCustomersAction } from "@/lib/actions/customer-actions";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Papa from "papaparse";

export default function CustomerImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<{ successes: number, failures: number, errors: string[] } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResults(null);

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setPreviewData(results.data.slice(0, 5)); // Preview first 5
                },
                error: (error) => {
                    toast.error("Failed to parse CSV: " + error.message);
                }
            });
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        setResults(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data as any[];

                // Call Server Action
                const response = await bulkImportCustomersAction(rows);

                if (response.success && response.data) {
                    const { successes, failures, errors } = response.data;
                    setResults({ successes, failures, errors });
                    toast.success(`Import complete: ${successes} processed, ${failures} failed.`);
                } else {
                    const errorMessage = typeof response.error === 'string'
                        ? response.error
                        : (response.error?.message || "Import failed");

                    toast.error(errorMessage);
                    setResults({ successes: 0, failures: rows.length, errors: [errorMessage] });
                }

                setImporting(false);
            }
        });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <PageHeader
                title="Import Customers"
                description="Bulk import or update customer records via CSV."
            />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload CSV</CardTitle>
                        <CardDescription>
                            Expected columns: <code>email</code> (required for match), <code>full_name</code>, <code>phone</code>, <code>address</code>, <code>status</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="csv">CSV File</Label>
                            <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} />
                        </div>

                        {previewData.length > 0 && (
                            <div className="mt-4 border rounded-md overflow-hidden">
                                <div className="bg-muted px-4 py-2 text-xs font-medium border-b">Preview (First 5 Rows)</div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {Object.keys(previewData[0]).map(header => (
                                                    <TableHead key={header}>{header}</TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.map((row, i) => (
                                                <TableRow key={i}>
                                                    {Object.values(row).map((val: any, j) => (
                                                        <TableCell key={j}>{val}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button onClick={handleImport} disabled={!file || importing}>
                                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Start Import
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {results && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Results</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <Alert variant="default" className="border-green-200 bg-green-50 text-green-800">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>{results.successes} records processed successfully.</AlertDescription>
                                </Alert>
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Failures</AlertTitle>
                                    <AlertDescription>{results.failures} records failed.</AlertDescription>
                                </Alert>
                            </div>

                            {results.errors.length > 0 && (
                                <div className="bg-muted p-4 rounded-md text-xs font-mono max-h-40 overflow-y-auto">
                                    <p className="font-bold mb-2">Error Log:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {results.errors.slice(0, 20).map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                        {results.errors.length > 20 && <li>...and {results.errors.length - 20} more</li>}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
