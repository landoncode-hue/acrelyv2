"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateCustomerAction } from "@/lib/actions/portal-actions";

interface PortalSettingsClientProps {
    customer: any;
}

export default function PortalSettingsClient({ customer }: PortalSettingsClientProps) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        phone: customer?.phone || "",
        address: customer?.address || "",
        next_of_kin_name: customer?.next_of_kin_name || "",
        next_of_kin_phone: customer?.next_of_kin_phone || ""
    });

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const result = await updateCustomerAction(formData);

            if (result?.success) {
                toast.success("Profile updated");
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Update failed";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your personal information.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your contact info and next of kin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name (Read Only)</Label>
                            <Input value={customer?.full_name || ""} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email (Read Only)</Label>
                            <Input value={customer?.email || ""} disabled className="bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <Label className="font-semibold block mb-4">Next of Kin</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={formData.next_of_kin_name} onChange={e => setFormData({ ...formData, next_of_kin_name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input value={formData.next_of_kin_phone} onChange={e => setFormData({ ...formData, next_of_kin_phone: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
