"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useProfile } from "@/hooks/use-profile";
import { Upload, CheckCircle2, AlertCircle, Loader2, FileText, Camera } from "lucide-react";
import { submitKycDataAction } from "@/lib/actions/kyc-actions";

export default function KycPage() {
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { profile } = useProfile();


    const [form, setForm] = useState({
        id_type: "",
        id_number: "",
        id_url: "",
        selfie_url: ""
    });

    const [uploadingId, setUploadingId] = useState(false);
    const [uploadingSelfie, setUploadingSelfie] = useState(false);

    useEffect(() => {
        async function load() {
            if (!profile) return;

            setLoading(false);
        }
        load();
    }, [profile]);

    const handleUpload = async (file: File, type: 'id' | 'selfie') => {
        if (!file) return;

        const isId = type === 'id';
        isId ? setUploadingId(true) : setUploadingSelfie(true);

        try {
            // 1. Get presigned URL
            const urlRes = await fetch('/api/storage/presigned-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bucket: 'kyc-documents', filename: file.name, contentType: file.type })
            });
            const urlData = await urlRes.json();

            if (!urlRes.ok) throw new Error(urlData.error || 'Failed to get upload URL');

            // 2. Upload file directly to MinIO
            const uploadRes = await fetch(urlData.url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadRes.ok) throw new Error('File upload failed');

            // 3. Keep the downloadUrl
            setForm(prev => ({
                ...prev,
                [isId ? 'id_url' : 'selfie_url']: urlData.downloadUrl
            }));

            toast.success(`${isId ? 'ID card' : 'Selfie'} uploaded successfully`);
        } catch (error: any) {
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            isId ? setUploadingId(false) : setUploadingSelfie(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.id_type || !form.id_number || !form.id_url || !form.selfie_url) {
            toast.error("Please complete all fields and uploads");
            return;
        }

        setSubmitting(true);
        const res = await submitKycDataAction(form as any);
        if (res?.success) {
            toast.success("KYC data submitted for verification");
            setCustomer((prev: any) => ({ ...prev, kyc_status: 'pending' }));
        } else {
            const errorMessage = typeof res?.error === 'string'
                ? res.error
                : (res?.error as any)?.message || "Submission failed";
            toast.error(errorMessage);
        }
        setSubmitting(false);
    };

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (customer?.kyc_status === 'verified') {
        return (
            <div className="max-w-2xl mx-auto text-center py-12 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
                <h1 className="text-3xl font-bold">Verification Complete</h1>
                <p className="text-muted-foreground">Your account is fully verified. You now have full access to all features.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Identity Verification (KYC)</h1>
                <p className="text-muted-foreground">Please provide your valid ID and a selfie for account verification.</p>
            </div>

            {customer?.kyc_status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-blue-800">
                    <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Verification in Progress</p>
                        <p className="text-xs opacity-80">Our team is currently reviewing your documents. This usually takes 24-48 hours.</p>
                    </div>
                </div>
            )}

            {customer?.kyc_status === 'rejected' && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex gap-3 text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Verification Rejected</p>
                        <p className="text-xs opacity-80">{customer.kyc_data?.rejection_reason || "Please check your documents and re-submit."}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>ID Information</CardTitle>
                        <CardDescription>Enter details from your government-issued ID.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>ID Type</Label>
                                <Select
                                    value={form.id_type}
                                    onValueChange={v => setForm({ ...form, id_type: v })}
                                    disabled={customer?.kyc_status === 'pending'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ID Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="international_passport">International Passport</SelectItem>
                                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                                        <SelectItem value="national_id">National ID (NIN)</SelectItem>
                                        <SelectItem value="voters_card">Voter's Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>ID Number</Label>
                                <Input
                                    value={form.id_number}
                                    onChange={e => setForm({ ...form, id_number: e.target.value })}
                                    placeholder="Enter your ID number"
                                    disabled={customer?.kyc_status === 'pending'}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-4">
                                <Label>ID Card Photo (Front)</Label>
                                <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-4 hover:border-primary transition-colors cursor-pointer relative">
                                    {form.id_url ? (
                                        <img src={form.id_url} className="mx-auto h-32 object-contain rounded-lg shadow-sm" alt="ID Front" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                                                <FileText className="h-6 w-6 text-primary/60" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Click to upload photo of ID card</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'id')}
                                        disabled={uploadingId || customer?.kyc_status === 'pending'}
                                        accept="image/*"
                                    />
                                    {uploadingId && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl"><Loader2 className="animate-spin" /></div>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Selfie with ID</Label>
                                <div className="border-2 border-dashed rounded-xl p-6 text-center space-y-4 hover:border-primary transition-colors cursor-pointer relative">
                                    {form.selfie_url ? (
                                        <img src={form.selfie_url} className="mx-auto h-32 object-contain rounded-lg shadow-sm" alt="Selfie" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                                                <Camera className="h-6 w-6 text-primary/60" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Upload a clear selfie holding your ID</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'selfie')}
                                        disabled={uploadingSelfie || customer?.kyc_status === 'pending'}
                                        accept="image/*"
                                    />
                                    {uploadingSelfie && <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl"><Loader2 className="animate-spin" /></div>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={submitting || customer?.kyc_status === 'pending'}
                >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                    Submit Verification
                </Button>
            </form>
        </div>
    );
}
