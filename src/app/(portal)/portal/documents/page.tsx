"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { FileText, Download, Receipt, FileCheck, Calendar, Home } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { getPortalDocumentsAction } from "@/lib/actions/portal-actions";
import { getSignedReceiptUrlAction } from "@/lib/actions/payment-actions";

interface Document {
    id: string;
    type: 'receipt' | 'agreement' | 'deed' | 'survey';
    title: string;
    description: string;
    date: string;
    downloadPath?: string;
    status: string;
    allocation_id?: string;
    estate_name?: string;
    plot_number?: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { profile } = useProfile();

    useEffect(() => {
        if (profile) fetchDocuments();
    }, [profile]);

    async function fetchDocuments() {
        setLoading(true);

        try {
            const res = await getPortalDocumentsAction();
            if (res?.success && res.data) {
                setDocuments(res.data as Document[]);
            } else {
                toast.error(typeof res?.error === 'string' ? res.error : res?.error?.message || "Failed to load documents");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load documents");
        }

        setLoading(false);
    }

    const handleDownload = async (doc: Document) => {
        if (!doc.downloadPath) {
            toast.error("Document not available for download");
            return;
        }

        try {
            const result = await getSignedReceiptUrlAction({ path: doc.downloadPath });
            if (result?.success && result?.data) {
                window.open(result.data, '_blank');
                toast.success("Document downloaded successfully");
            } else {
                toast.error(typeof result?.error === 'string' ? result.error : result?.error?.message || "Document not found or not generated yet.");
            }
        } catch (error) {
            console.error("Error downloading document:", error);
            toast.error("Failed to download document");
        }
    };

    const getDocumentIcon = (type: string) => {
        switch (type) {
            case 'receipt': return <Receipt className="h-5 w-5" />;
            case 'agreement': return <FileCheck className="h-5 w-5" />;
            case 'deed': return <FileText className="h-5 w-5" />;
            case 'survey': return <Home className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
                <p className="text-muted-foreground">Access your receipts, agreements, and property documents</p>
            </div>

            {/* Document Categories */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <Receipt className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{documents.filter(d => d.type === 'receipt').length}</p>
                                <p className="text-sm text-muted-foreground">Receipts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <FileCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">—</p>
                                <p className="text-sm text-muted-foreground">Agreements</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">—</p>
                                <p className="text-sm text-muted-foreground">Deeds</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <Home className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-muted-foreground">—</p>
                                <p className="text-sm text-muted-foreground">Surveys</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Receipts Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-green-600" />
                        Payment Receipts
                    </CardTitle>
                    <CardDescription>Download receipts for your verified payments</CardDescription>
                </CardHeader>
                <CardContent>
                    {documents.filter(d => d.type === 'receipt').length > 0 ? (
                        <div className="divide-y">
                            {documents.filter(d => d.type === 'receipt').map(doc => (
                                <div key={doc.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-green-50">
                                            <Receipt className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{doc.title}</p>
                                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(doc.date).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No receipts available yet.</p>
                            <p className="text-sm">Receipts will appear here after your payments are verified.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Documents Section */}
            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle>Upcoming Documents</CardTitle>
                    <CardDescription>These documents will be available once your allocation is fully paid</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                            <div className="flex items-center gap-3 mb-2">
                                <FileCheck className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Allocation Agreement</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your official allocation agreement document will be available for download after full payment.
                            </p>
                            <Badge variant="secondary" className="mt-2">Pending</Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Deed of Assignment</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your deed of assignment will be processed after allocation approval and full payment.
                            </p>
                            <Badge variant="secondary" className="mt-2">Pending</Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                            <div className="flex items-center gap-3 mb-2">
                                <Home className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Survey Plan</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your plot survey plan will be available after land surveying is completed.
                            </p>
                            <Badge variant="secondary" className="mt-2">Pending</Badge>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 border border-dashed">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Certificate of Occupancy</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your C of O will be processed through the appropriate government channels.
                            </p>
                            <Badge variant="secondary" className="mt-2">Pending</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
