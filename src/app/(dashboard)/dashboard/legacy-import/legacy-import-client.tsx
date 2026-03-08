"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { normalizePhone } from "@/lib/utils/phone";
import { Checkbox } from "@/components/ui/checkbox";
import { importLegacyDataAction } from "@/lib/actions/legacy-import-actions";

type Estate = {
    id: string;
    name: string;
    price: number;
};

type PhoneNumber = {
    id: string;
    number: string;
    label: string;
    isPrimary: boolean;
};

export function LegacyImportClient({ initialEstates }: { initialEstates: Estate[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [estates] = useState<Estate[]>(initialEstates || []);

    // Customer Data
    const [customerData, setCustomerData] = useState({
        full_name: "",
        email: "",
        address: "",
        occupation: "",
        next_of_kin_name: "",
        next_of_kin_phone: "",
    });

    // Phone Numbers (multiple)
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([
        { id: "1", number: "", label: "Primary", isPrimary: true }
    ]);

    // Plot Information
    const [plotData, setPlotData] = useState({
        estate_id: "",
        plot_number: "",
        dimensions: "",
        is_half_plot: false,
        half_plot_designation: "" as "" | "A" | "B",
    });

    // Payment Information
    const [paymentData, setPaymentData] = useState({
        amount_paid: "",
        balance: "",
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "bank_transfer" as "bank_transfer" | "cash" | "cheque" | "pos",
        transaction_ref: "",
    });


    const addPhoneNumber = () => {
        setPhoneNumbers([
            ...phoneNumbers,
            {
                id: Date.now().toString(),
                number: "",
                label: "Additional",
                isPrimary: false
            }
        ]);
    };

    const removePhoneNumber = (id: string) => {
        if (phoneNumbers.length === 1) {
            toast.error("At least one phone number is required");
            return;
        }
        setPhoneNumbers(phoneNumbers.filter(p => p.id !== id));
    };

    const updatePhoneNumber = (id: string, field: keyof PhoneNumber, value: any) => {
        setPhoneNumbers(phoneNumbers.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const setPrimaryPhone = (id: string) => {
        setPhoneNumbers(phoneNumbers.map(p => ({
            ...p,
            isPrimary: p.id === id,
            label: p.id === id ? "Primary" : (p.label === "Primary" ? "Additional" : p.label)
        })));
    };

    const validateForm = (): boolean => {
        // Customer validation
        if (!customerData.full_name.trim()) {
            toast.error("Customer name is required");
            return false;
        }

        // Phone validation
        const validPhones = phoneNumbers.filter(p => p.number.trim());
        if (validPhones.length === 0) {
            toast.error("At least one phone number is required");
            return false;
        }

        // Plot validation
        if (!plotData.estate_id) {
            toast.error("Please select an estate");
            return false;
        }

        // Plot number is now optional for legacy imports - will default to UNASSIGNED

        if (plotData.is_half_plot && !plotData.half_plot_designation) {
            toast.error("Please select half plot designation (A or B)");
            return false;
        }

        // Payment validation
        const amountPaid = parseFloat(paymentData.amount_paid || "0");
        const balance = parseFloat(paymentData.balance || "0");

        if (amountPaid < 0 || balance < 0) {
            toast.error("Payment amounts cannot be negative");
            return false;
        }

        if (amountPaid === 0 && balance === 0) {
            toast.error("Please enter payment amount or balance");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Construct payload for server action
            const payload = {
                customer: customerData,
                phoneNumbers: phoneNumbers.map(p => ({
                    number: p.number,
                    label: p.label,
                    isPrimary: p.isPrimary
                })),
                plot: {
                    estate_id: plotData.estate_id,
                    plot_number: plotData.plot_number.trim() || `UNASSIGNED-${Date.now().toString().slice(-6)}`,
                    dimensions: plotData.dimensions.trim(),
                    is_half_plot: plotData.is_half_plot,
                    // Fix: Ensure we pass null if it's not a half plot or empty string
                    half_plot_designation: (plotData.is_half_plot && plotData.half_plot_designation)
                        ? plotData.half_plot_designation as "A" | "B"
                        : null,
                },
                payment: paymentData
            };

            const result = await importLegacyDataAction(payload);

            if (!result.success) {
                // Log debug info if available (contains Postgres error details)
                if (result.error?.details) {
                    console.error("SERVER DEBUG INFO:", result.error.details);
                }
                throw new Error(result.error?.message || "Import failed");
            }

            toast.success("Legacy record created successfully!");

            // Reset form
            setCustomerData({
                full_name: "",
                email: "",
                address: "",
                occupation: "",
                next_of_kin_name: "",
                next_of_kin_phone: "",
            });
            setPhoneNumbers([{ id: "1", number: "", label: "Primary", isPrimary: true }]);
            setPlotData({
                estate_id: "",
                plot_number: "",
                dimensions: "",
                is_half_plot: false,
                half_plot_designation: "",
            });
            setPaymentData({
                amount_paid: "",
                balance: "",
                payment_date: new Date().toISOString().split('T')[0],
                payment_method: "bank_transfer",
                transaction_ref: "",
            });

        } catch (error: any) {
            console.error("Error creating legacy record:", error);
            toast.error(error.message || "Failed to create record");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">Manual Legacy Data Entry</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Enter customer, plot, and payment information for legacy records
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                        <CardDescription>Basic customer details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="full_name">Full Name *</Label>
                                <Input
                                    id="full_name"
                                    value={customerData.full_name}
                                    onChange={(e) => setCustomerData({ ...customerData, full_name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={customerData.email}
                                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                                    placeholder="customer@example.com"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="occupation">Occupation</Label>
                                <Input
                                    id="occupation"
                                    value={customerData.occupation}
                                    onChange={(e) => setCustomerData({ ...customerData, occupation: e.target.value })}
                                    placeholder="Engineer"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={customerData.address}
                                    onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                                    placeholder="123 Main Street, Lagos"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Phone Numbers */}
                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Phone Numbers *</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addPhoneNumber}
                                    className="text-xs sm:text-sm"
                                >
                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Add Phone
                                </Button>
                            </div>

                            {phoneNumbers.map((phone, index) => (
                                <div key={phone.id} className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex-1">
                                        <Input
                                            value={phone.number}
                                            onChange={(e) => updatePhoneNumber(phone.id, "number", e.target.value)}
                                            onBlur={(e) => {
                                                const normalized = normalizePhone(e.target.value);
                                                updatePhoneNumber(phone.id, "number", normalized);
                                            }}
                                            placeholder="0803..."
                                            required={index === 0}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select
                                            value={phone.label}
                                            onValueChange={(value) => updatePhoneNumber(phone.id, "label", value)}
                                        >
                                            <SelectTrigger className="w-full sm:w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Primary">Primary</SelectItem>
                                                <SelectItem value="Mobile">Mobile</SelectItem>
                                                <SelectItem value="Office">Office</SelectItem>
                                                <SelectItem value="Home">Home</SelectItem>
                                                <SelectItem value="Additional">Additional</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant={phone.isPrimary ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPrimaryPhone(phone.id)}
                                            className="whitespace-nowrap text-xs sm:text-sm"
                                            title="Set as primary"
                                        >
                                            {phone.isPrimary ? "Primary" : "Set Primary"}
                                        </Button>
                                        {phoneNumbers.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removePhoneNumber(phone.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Next of Kin */}
                        <div className="space-y-3 pt-4 border-t">
                            <Label className="text-base font-semibold">Next of Kin</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="next_of_kin_name">Name</Label>
                                    <Input
                                        id="next_of_kin_name"
                                        value={customerData.next_of_kin_name}
                                        onChange={(e) => setCustomerData({ ...customerData, next_of_kin_name: e.target.value })}
                                        placeholder="Jane Doe"
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="next_of_kin_phone">Phone</Label>
                                    <Input
                                        id="next_of_kin_phone"
                                        value={customerData.next_of_kin_phone}
                                        onChange={(e) => setCustomerData({ ...customerData, next_of_kin_phone: e.target.value })}
                                        placeholder="0803..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Plot Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plot Information</CardTitle>
                        <CardDescription>Details about the allocated plot</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="estate">Estate *</Label>
                                <Select
                                    value={plotData.estate_id}
                                    onValueChange={(value) => setPlotData({ ...plotData, estate_id: value })}
                                    required
                                >
                                    <SelectTrigger id="estate" className="w-full">
                                        <SelectValue placeholder="Select estate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {estates.map((estate) => (
                                            <SelectItem key={estate.id} value={estate.id}>
                                                {estate.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="plot_number">Plot Number (Leave blank for UNASSIGNED)</Label>
                                <Input
                                    id="plot_number"
                                    value={plotData.plot_number}
                                    onChange={(e) => {
                                        let val = e.target.value.toUpperCase();
                                        // Auto-pad if numeric
                                        if (/^\d+$/.test(val)) {
                                            val = `PLOT-${val.padStart(3, '0')}`;
                                        }
                                        setPlotData({ ...plotData, plot_number: val });
                                    }}
                                    placeholder="e.g. 101"
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Standard Format: PLOT-001
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dimensions">Dimensions</Label>
                                <Input
                                    id="dimensions"
                                    value={plotData.dimensions}
                                    onChange={(e) => setPlotData({ ...plotData, dimensions: e.target.value })}
                                    placeholder="50x100"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-3 sm:col-span-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_half_plot"
                                        checked={plotData.is_half_plot}
                                        onCheckedChange={(checked) =>
                                            setPlotData({
                                                ...plotData,
                                                is_half_plot: checked as boolean,
                                                half_plot_designation: checked ? "" : ""
                                            })
                                        }
                                    />
                                    <Label htmlFor="is_half_plot" className="cursor-pointer">
                                        This is a half plot
                                    </Label>
                                </div>

                                {plotData.is_half_plot && (
                                    <div className="space-y-2 ml-6">
                                        <Label htmlFor="half_plot_designation">Half Plot Designation *</Label>
                                        <Select
                                            value={plotData.half_plot_designation}
                                            onValueChange={(value: "A" | "B") =>
                                                setPlotData({ ...plotData, half_plot_designation: value })
                                            }
                                            required={plotData.is_half_plot}
                                        >
                                            <SelectTrigger id="half_plot_designation" className="w-full sm:w-[200px]">
                                                <SelectValue placeholder="Select A or B" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A (First Half)</SelectItem>
                                                <SelectItem value="B">B (Second Half)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Acrely Designation: {plotData.plot_number}{plotData.half_plot_designation || ""}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                        <CardDescription>Payment details and balance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount_paid">Amount Paid (₦)</Label>
                                <Input
                                    id="amount_paid"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={paymentData.amount_paid}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount_paid: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="balance">Balance (₦)</Label>
                                <Input
                                    id="balance"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={paymentData.balance}
                                    onChange={(e) => setPaymentData({ ...paymentData, balance: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_date">Payment Date *</Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    value={paymentData.payment_date}
                                    onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Payment Method</Label>
                                <Select
                                    value={paymentData.payment_method}
                                    onValueChange={(value: any) => setPaymentData({ ...paymentData, payment_method: value })}
                                >
                                    <SelectTrigger id="payment_method" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="pos">POS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="transaction_ref">Transaction Reference</Label>
                                <Input
                                    id="transaction_ref"
                                    value={paymentData.transaction_ref}
                                    onChange={(e) => setPaymentData({ ...paymentData, transaction_ref: e.target.value })}
                                    placeholder="Optional - auto-generated if empty"
                                    className="w-full"
                                />
                            </div>

                            {/* Summary */}
                            {(paymentData.amount_paid || paymentData.balance) && (
                                <div className="sm:col-span-2 p-4 bg-muted rounded-lg">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Amount Paid:</span>
                                            <span>₦{parseFloat(paymentData.amount_paid || "0").toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Balance:</span>
                                            <span>₦{parseFloat(paymentData.balance || "0").toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t font-semibold">
                                            <span>Total:</span>
                                            <span>
                                                ₦{(parseFloat(paymentData.amount_paid || "0") + parseFloat(paymentData.balance || "0")).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="min-w-[150px]">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Record"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
