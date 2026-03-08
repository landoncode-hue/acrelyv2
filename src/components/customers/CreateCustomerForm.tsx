"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { normalizePhone } from "@/lib/utils/phone";
import { createCustomerAction, checkCustomerConflictAction } from "@/lib/actions/customer-actions";

export default function CreateCustomerForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [conflict, setConflict] = useState<{ found: boolean; type: string; name: string; agent: string } | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        occupation: "",
        next_of_kin_name: "",
        next_of_kin_phone: "",
        joined_at: ""
    });

    const checkConflict = async (overridePhone?: string, overrideEmail?: string) => {
        setConflict(null);
        const checkPhone = overridePhone !== undefined ? overridePhone : formData.phone;
        const checkEmail = overrideEmail !== undefined ? overrideEmail : formData.email;

        if (!checkPhone && !checkEmail) return;

        const result = await checkCustomerConflictAction(checkEmail, checkPhone);
        if (result?.data) {
            setConflict(result.data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await createCustomerAction(formData);

            if (!response.success || response.error) {
                const errorMessage = typeof response.error === 'string'
                    ? response.error
                    : response.error?.message || "Failed to execute action";
                throw new Error(errorMessage);
            }

            const result = response.data;

            if (!result) {
                throw new Error("No data returned from server");
            }

            if (!(result as any).success) {
                if ((result as any).conflict) {
                    setConflict((result as any).conflict);
                    toast.error("Duplicate customer detected");
                    return;
                }
                throw new Error((result as any).error || "Unknown error");
            }

            toast.success("Customer created successfully");
            router.push("/dashboard/customers");
        } catch (e: any) {
            toast.error(e.message || "Failed to create customer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
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
                    <CardTitle>Register New Customer</CardTitle>
                    <CardDescription>Create a customer profile manually.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    onBlur={() => {
                                        const normalized = normalizePhone(formData.phone);
                                        setFormData(prev => ({ ...prev, phone: normalized }));
                                        checkConflict(normalized, undefined);
                                    }}
                                    required
                                    placeholder="0803..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                onBlur={() => checkConflict(undefined, undefined)}
                                placeholder="customer@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Address</Label>
                            <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Occupation</Label>
                            <Input value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Joined Date (Optional)</Label>
                            <Input
                                type="date"
                                value={formData.joined_at}
                                onChange={e => setFormData({ ...formData, joined_at: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Leave blank to use today. Use this to backdate legacy customers.
                            </p>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <Label className="text-lg font-semibold block mb-4">Next of Kin</Label>
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

                        <Button type="submit" className="w-full" disabled={loading || (conflict?.found ?? false)}>
                            {loading ? "Creating..." : "Create Customer"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
