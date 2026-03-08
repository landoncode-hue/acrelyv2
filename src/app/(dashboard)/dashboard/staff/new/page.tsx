"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InviteStaffPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        role: "frontdesk"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/staff/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to invite staff");

            toast.success("Staff member invited successfully");
            router.push("/dashboard/staff");
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Invite Staff Member</CardTitle>
                    <CardDescription>Send an email invitation to a new team member.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="frontdesk">Front Desk</SelectItem>
                                    <SelectItem value="md">Managing Director (MD)</SelectItem>
                                    <SelectItem value="ceo">CEO</SelectItem>
                                    <SelectItem value="sysadmin">System Administrator</SelectItem>
                                    <SelectItem value="agent">Agent (Login Only)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Determines access level and permissions within the dashboard.
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending Invitation..." : "Send Invitation"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
