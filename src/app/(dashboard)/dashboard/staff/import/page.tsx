"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Upload, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Switch } from "@/components/ui/switch";

interface ImportResult {
    success: any[];
    failed: any[];
}

export default function StaffImportPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [sendInvites, setSendInvites] = useState(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast.error("Please select a CSV file");
            return;
        }

        setImporting(true);
        setProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('send_invites', sendInvites.toString());

            setProgress(30);

            const response = await fetch('/api/staff/import', {
                method: 'POST',
                body: formData,
            });

            setProgress(70);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Import failed');
            }

            setProgress(100);
            setResult(data.results);

            if (data.results.failed.length === 0) {
                toast.success(`Successfully imported ${data.results.success.length} staff members!`);
            } else {
                toast.warning(`Imported ${data.results.success.length} staff members with ${data.results.failed.length} errors`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "full_name,email,phone,role,employee_id,department\nJohn Doe,john@example.com,+2348012345678,frontdesk,EMP-001,Sales\nJane Smith,jane@example.com,+2348087654321,md,EMP-002,Operations";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'staff_import_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const downloadErrorReport = () => {
        if (!result || result.failed.length === 0) return;

        const headers = ['Row', 'Error', 'Data'];
        const rows = result.failed.map(f => [
            f.row,
            f.error,
            JSON.stringify(f.data)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'import_errors.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader
                title="Bulk Import Staff"
                description="Import multiple staff members from a CSV file"
                actions={
                    <Link href="/dashboard/staff">
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Staff
                        </Button>
                    </Link>
                }
            />

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>Import Instructions</CardTitle>
                    <CardDescription>Follow these steps to import staff members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">1. Download Template</h4>
                        <p className="text-sm text-muted-foreground">
                            Download the CSV template with the correct column format
                        </p>
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">2. Fill in Staff Data</h4>
                        <p className="text-sm text-muted-foreground">
                            Required fields: <code className="bg-muted px-1 py-0.5 rounded">full_name</code>, <code className="bg-muted px-1 py-0.5 rounded">email</code>, <code className="bg-muted px-1 py-0.5 rounded">role</code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Valid roles: <code className="bg-muted px-1 py-0.5 rounded">frontdesk</code>, <code className="bg-muted px-1 py-0.5 rounded">md</code>, <code className="bg-muted px-1 py-0.5 rounded">ceo</code>, <code className="bg-muted px-1 py-0.5 rounded">sysadmin</code>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium">3. Upload and Import</h4>
                        <p className="text-sm text-muted-foreground">
                            Upload your filled CSV file and click Import to process
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                    <CardDescription>Select your CSV file to import</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="csv-file">CSV File</Label>
                        <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={importing}
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="send-invites"
                            checked={sendInvites}
                            onCheckedChange={setSendInvites}
                            disabled={importing}
                        />
                        <Label htmlFor="send-invites" className="cursor-pointer">
                            Send invitation emails to imported staff
                        </Label>
                    </div>

                    {importing && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Importing...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} />
                        </div>
                    )}

                    <Button
                        onClick={handleImport}
                        disabled={!file || importing}
                        className="w-full"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {importing ? 'Importing...' : 'Import Staff'}
                    </Button>
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Results</CardTitle>
                        <CardDescription>Summary of the import operation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-2xl font-bold text-green-900">{result.success.length}</p>
                                    <p className="text-sm text-green-700">Successful</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50 border-red-200">
                                <XCircle className="h-8 w-8 text-red-600" />
                                <div>
                                    <p className="text-2xl font-bold text-red-900">{result.failed.length}</p>
                                    <p className="text-sm text-red-700">Failed</p>
                                </div>
                            </div>
                        </div>

                        {result.success.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Successfully Imported
                                </h4>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {result.success.map((s, i) => (
                                        <div key={i} className="text-sm flex items-center justify-between py-1 px-2 bg-muted rounded">
                                            <span>{s.full_name} ({s.email})</span>
                                            <Badge variant="outline" className="text-xs">{s.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {result.failed.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        Failed Imports
                                    </h4>
                                    <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Error Report
                                    </Button>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                    {result.failed.map((f, i) => (
                                        <div key={i} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                                            <p className="font-medium">Row {f.row}</p>
                                            <p className="text-red-700">{f.error}</p>
                                            {f.data && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {f.data.email || 'No email'}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.push('/dashboard/staff')}>
                                View Staff List
                            </Button>
                            <Button variant="outline" onClick={() => {
                                setFile(null);
                                setResult(null);
                                setProgress(0);
                            }}>
                                Import Another File
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
