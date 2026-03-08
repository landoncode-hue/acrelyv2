"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { convertLeadAction, checkCustomerConflictAction } from "@/lib/actions/customer-actions";

interface ConvertToCustomerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: {
        id: string;
        full_name: string;
        phone: string;
        email?: string;
        interest?: string;
    };
}

export function ConvertToCustomerModal({
    open,
    onOpenChange,
    lead
}: ConvertToCustomerModalProps) {
    const [loading, setLoading] = useState(false);
    const [duplicate, setDuplicate] = useState<any>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: lead.email || "",
        address: "",
        occupation: "",
        nextOfKinName: "",
        nextOfKinPhone: ""
    });

    // Check for duplicates on mount
    useEffect(() => {
        checkDuplicate();
    }, []);

    async function checkDuplicate() {
        if (!formData.email && !lead.phone) return;

        const result = await checkCustomerConflictAction(formData.email, lead.phone);

        if (result?.data) {
            setDuplicate(result.data);
        } else {
            setDuplicate(null);
        }
    }

    async function handleConvert() {
        console.log("CLIENT DEBUG: handleConvert started");
        setLoading(true);

        try {
            const payload = {
                leadId: lead.id,
                email: formData.email,
                address: formData.address,
                occupation: formData.occupation,
                nextOfKinName: formData.nextOfKinName,
                nextOfKinPhone: formData.nextOfKinPhone
            };
            console.log("CLIENT DEBUG: calling convertLeadAction", payload);

            const response = await convertLeadAction(payload);
            console.log("CLIENT DEBUG: convertLeadAction response", response);

            if (!response.success || response.error) {
                // Check if it's a conflict error logic if generic error message
                const errorObj = response.error as any;
                if (errorObj?.message?.includes("Duplicate")) {
                    toast.error("Duplicate customer detected");
                    // Note: To show duplicate details we would need the backend to return them in error details
                    // For now just show toast
                    return;
                }

                const errorMessage = typeof response.error === 'string'
                    ? response.error
                    : response.error?.message || "Failed to convert lead";
                throw new Error(errorMessage);
            }

            const customer = response.data; // Data IS the customer

            if (!customer) {
                throw new Error("No data returned from server");
            }

            // No check for !customer.success, because customer IS the data object

            console.log("CLIENT DEBUG: Conversion success, redirecting...");
            toast.success(`Lead converted successfully! Customer: ${customer.full_name}`);

            // Redirect to customer profile
            router.push(`/dashboard/customers/${customer.id}`);

            onOpenChange(false);
        } catch (error: any) {
            console.log("CLIENT DEBUG: Conversion error", error);
            toast.error(error.message || "Failed to convert lead");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Convert to Customer
                    </DialogTitle>
                    <DialogDescription>
                        This will create a new customer profile for <strong>{lead.full_name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {duplicate && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            A customer with this {duplicate.type === 'Customer' ? 'phone number' : 'email'} already exists:
                            <br />
                            <strong>{duplicate.name}</strong> ({duplicate.type})
                            <br />
                            Registered by: <strong>{duplicate.agent}</strong>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-4 py-4">
                    {/* Pre-filled fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">Name</Label>
                            <Input
                                value={lead.full_name}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">Phone</Label>
                            <Input
                                value={lead.phone}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>

                    {/* Editable fields */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            onBlur={checkDuplicate}
                            placeholder="customer@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="address">Residential Address</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Full home or office address"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                            id="occupation"
                            value={formData.occupation}
                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                            placeholder="e.g. Software Engineer, Civil Servant"
                        />
                    </div>

                    {/* Next of Kin */}
                    <div className="border-t pt-4 mt-2">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            Next of Kin Information
                            <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-wider">(Optional)</span>
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="nokName">Full Name</Label>
                                <Input
                                    id="nokName"
                                    value={formData.nextOfKinName}
                                    onChange={(e) => setFormData({ ...formData, nextOfKinName: e.target.value })}
                                    placeholder="Kin's full name"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="nokPhone">Phone Number</Label>
                                <Input
                                    id="nokPhone"
                                    value={formData.nextOfKinPhone}
                                    onChange={(e) => setFormData({ ...formData, nextOfKinPhone: e.target.value })}
                                    placeholder="+234..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConvert}
                        disabled={loading || !!duplicate}
                    >
                        {loading ? "Converting..." : "Confirm Conversion"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
