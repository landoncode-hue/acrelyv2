"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createLeadAction, checkLeadConflictAction } from "@/lib/actions/leads-actions";

export function CreateLeadClient({ estates }: { estates: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Conflict State
    const [conflict, setConflict] = useState<{ found: boolean; type: string; name: string; agent: string } | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        source: "Instagram",
        interest: ""
    });

    const checkConflict = async () => {
        setConflict(null);
        if (!formData.phone && !formData.email) return;

        try {
            const result = await checkLeadConflictAction(
                formData.email || undefined,
                formData.phone || undefined
            );

            // result is { data: { conflict: ... } } or error
            if (result?.data?.found) {
                setConflict(result.data as any);
            }
        } catch (e) {
            console.error("Conflict check failed", e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createLeadAction({
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                source: formData.source,
                interest: formData.interest
            });

            if (result?.success) {
                toast.success("Lead captured successfully");
                router.push("/dashboard/leads");
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to create lead";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to create lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {conflict && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Duplicate Warning</AlertTitle>
                    <AlertDescription>
                        This person exists as a <strong>{conflict.type}</strong> ({conflict.name}).<br />
                        Registered by: <strong>{conflict.agent}</strong>.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Capture New Lead</CardTitle>
                    <CardDescription>Record a potential client interest.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="full_name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    onBlur={checkConflict}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    onBlur={checkConflict}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Source</Label>
                                <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Instagram">Instagram</SelectItem>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                        <SelectItem value="Twitter">Twitter/X</SelectItem>
                                        <SelectItem value="Referral">Referral</SelectItem>
                                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                                        <SelectItem value="Radio">Radio</SelectItem>
                                        <SelectItem value="Billboard">Billboard</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Estate of Interest</Label>
                                <Select value={formData.interest} onValueChange={(v) => setFormData({ ...formData, interest: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Estate..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General Inquiry</SelectItem>
                                        <SelectItem value="Investment">Land Investment (Any)</SelectItem>
                                        {estates.map(e => (
                                            <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading || (conflict?.found ?? false)}>
                            {loading ? "Saving..." : "Save Lead"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
