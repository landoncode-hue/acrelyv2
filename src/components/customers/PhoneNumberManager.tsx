"use client";

import { useState, useEffect, useCallback } from "react";
import { Phone, Plus, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    getCustomerPhoneNumbersAction,
    addCustomerPhoneNumberAction,
    updateCustomerPhoneNumberAction,
    deleteCustomerPhoneNumberAction,
    setPrimaryPhoneNumberAction,
} from "@/lib/actions/customer-phone-actions";
import { normalizePhone, type PhoneNumber } from "@/lib/utils/phone";

interface PhoneNumberManagerProps {
    customerId: string;
    editable?: boolean;
    compact?: boolean;
}

export function PhoneNumberManager({
    customerId,
    editable = false,
    compact = false,
}: PhoneNumberManagerProps) {
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newPhone, setNewPhone] = useState({ number: "", label: "Mobile" });

    const loadPhoneNumbers = useCallback(async () => {
        const result = await getCustomerPhoneNumbersAction(customerId);
        if (result.success) {
            setPhoneNumbers(result.data || []);
        }
        setLoading(false);
    }, [customerId]);

    useEffect(() => {
        const init = async () => {
            await loadPhoneNumbers();
        };
        void init();
    }, [loadPhoneNumbers]);

    const handleAddPhone = async () => {
        if (!newPhone.number.trim()) {
            toast.error("Please enter a phone number");
            return;
        }

        const normalized = normalizePhone(newPhone.number);
        const result = await addCustomerPhoneNumberAction(
            customerId,
            normalized,
            newPhone.label,
            phoneNumbers.length === 0 // Set as primary if it's the first number
        );

        if (result.success) {
            toast.success("Phone number added");
            setNewPhone({ number: "", label: "Mobile" });
            setAdding(false);
            loadPhoneNumbers();
        } else {
            const errorMsg = typeof result.error === 'string' ? result.error : "Failed to add phone number";
            toast.error(errorMsg);
        }
    };

    const handleSetPrimary = async (phoneId: string) => {
        const result = await setPrimaryPhoneNumberAction(phoneId, customerId);
        if (result.success) {
            toast.success("Primary phone updated");
            loadPhoneNumbers();
        } else {
            const errorMsg = typeof result.error === 'string' ? result.error : "Failed to update primary phone";
            toast.error(errorMsg);
        }
    };

    const handleDelete = async (phoneId: string) => {
        if (phoneNumbers.length === 1) {
            toast.error("Cannot delete the only phone number");
            return;
        }

        const result = await deleteCustomerPhoneNumberAction(phoneId);
        if (result.success) {
            toast.success("Phone number deleted");
            loadPhoneNumbers();
        } else {
            const errorMsg = typeof result.error === 'string' ? result.error : "Failed to delete phone number";
            toast.error(errorMsg);
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-muted-foreground">Loading phone numbers...</div>
        );
    }

    // Compact view - just display
    if (compact) {
        const primary = phoneNumbers.find((p) => p.is_primary);
        const others = phoneNumbers.filter((p) => !p.is_primary);

        return (
            <div className="space-y-1">
                {primary && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">{primary.phone_number}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            Primary
                        </Badge>
                    </div>
                )}
                {others.map((phone) => (
                    <div key={phone.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{phone.phone_number}</span>
                        <span className="text-xs">({phone.label})</span>
                    </div>
                ))}
            </div>
        );
    }

    // Full view with editing
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Phone Numbers</CardTitle>
                        <CardDescription>Manage customer contact numbers</CardDescription>
                    </div>
                    {editable && !adding && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdding(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {phoneNumbers.map((phone) => (
                    <div
                        key={phone.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-card"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{phone.phone_number}</span>
                                    {phone.is_primary && (
                                        <Badge variant="default" className="text-xs shrink-0">
                                            <Star className="h-3 w-3 mr-1" />
                                            Primary
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">{phone.label}</div>
                            </div>
                        </div>
                        {editable && (
                            <div className="flex items-center gap-1 shrink-0">
                                {!phone.is_primary && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSetPrimary(phone.id)}
                                        title="Set as primary"
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                )}
                                {phoneNumbers.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(phone.id)}
                                        title="Delete"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {adding && (
                    <div className="p-3 rounded-lg border bg-muted/50 space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="new-phone">Phone Number</Label>
                            <Input
                                id="new-phone"
                                value={newPhone.number}
                                onChange={(e) => setNewPhone({ ...newPhone, number: e.target.value })}
                                onBlur={(e) => {
                                    const normalized = normalizePhone(e.target.value);
                                    setNewPhone({ ...newPhone, number: normalized });
                                }}
                                placeholder="0803..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone-label">Label</Label>
                            <Select
                                value={newPhone.label}
                                onValueChange={(value) => setNewPhone({ ...newPhone, label: value })}
                            >
                                <SelectTrigger id="phone-label">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mobile">Mobile</SelectItem>
                                    <SelectItem value="Office">Office</SelectItem>
                                    <SelectItem value="Home">Home</SelectItem>
                                    <SelectItem value="Additional">Additional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddPhone} size="sm" className="flex-1">
                                Add Phone
                            </Button>
                            <Button
                                onClick={() => {
                                    setAdding(false);
                                    setNewPhone({ number: "", label: "Mobile" });
                                }}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {phoneNumbers.length === 0 && !adding && (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                        No phone numbers added yet
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Simple display component for phone numbers (read-only)
 */
export function PhoneNumberDisplay({ customerId }: { customerId: string }) {
    return <PhoneNumberManager customerId={customerId} editable={false} compact={false} />;
}

/**
 * Compact inline display of phone numbers
 */
export function PhoneNumberCompact({ customerId }: { customerId: string }) {
    return <PhoneNumberManager customerId={customerId} editable={false} compact={true} />;
}
