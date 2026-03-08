"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerAgentAction } from "@/lib/actions/agent-actions";

interface CreateAgentClientProps {
    profiles: { id: string; full_name: string; email: string }[];
}

export function CreateAgentClient({ profiles }: CreateAgentClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        profile_id: "",
        commission_rate: "5",
        bank_name: "",
        account_number: "",
        account_name: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.profile_id) {
            toast.error("Please select a user profile");
            return;
        }

        setLoading(true);

        try {
            const result = await registerAgentAction({
                profile_id: formData.profile_id,
                commission_rate: parseFloat(formData.commission_rate),
                bank_name: formData.bank_name,
                account_number: formData.account_number,
                account_name: formData.account_name
            });

            if (result?.success) {
                toast.success("Agent registered successfully");
                router.push("/dashboard/agents");
            } else {
                throw new Error(typeof result?.error === 'string' ? result.error : result?.error?.message || "Failed to register agent");
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to register agent");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Register Agent</CardTitle>
                    <CardDescription>Promote a user or staff to Agent status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>User Profile</Label>
                            <Combobox
                                options={profiles.map(p => ({
                                    value: p.id,
                                    label: `${p.full_name} (${p.email})`
                                }))}
                                value={formData.profile_id}
                                onSelect={(v) => setFormData({ ...formData, profile_id: v })}
                                placeholder="Select User"
                                searchPlaceholder="Search users..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Commission Rate (%)</Label>
                            <Input type="number" step="0.1" value={formData.commission_rate} onChange={e => setFormData({ ...formData, commission_rate: e.target.value })} required />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <Label className="text-lg font-semibold block mb-4">Bank Details</Label>
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input value={formData.bank_name} onChange={e => setFormData({ ...formData, bank_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input value={formData.account_number} onChange={e => setFormData({ ...formData, account_number: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Name</Label>
                                    <Input value={formData.account_name} onChange={e => setFormData({ ...formData, account_name: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Registering..." : "Register Agent"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
