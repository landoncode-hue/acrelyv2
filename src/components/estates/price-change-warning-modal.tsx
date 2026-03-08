"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface PriceChangeWarningModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    oldPrice: number;
    newPrice: number;
    onConfirm: () => void;
    loading?: boolean;
}

export function PriceChangeWarningModal({
    open,
    onOpenChange,
    oldPrice,
    newPrice,
    onConfirm,
    loading = false
}: PriceChangeWarningModalProps) {
    const priceDifference = newPrice - oldPrice;
    const percentageChange = oldPrice > 0 ? ((priceDifference / oldPrice) * 100).toFixed(1) : 0;
    const isIncrease = priceDifference > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Confirm Base Price Change
                    </DialogTitle>
                    <DialogDescription>
                        You are about to change the base price for this estate
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Current Price</p>
                            <p className="text-2xl font-bold">₦{oldPrice.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">New Price</p>
                            <p className="text-2xl font-bold text-brand-primary">
                                ₦{newPrice.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Change Indicator */}
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${isIncrease ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {isIncrease ? (
                            <TrendingUp className="h-5 w-5" />
                        ) : (
                            <TrendingDown className="h-5 w-5" />
                        )}
                        <div>
                            <p className="font-semibold">
                                {isIncrease ? 'Increase' : 'Decrease'} of ₦{Math.abs(priceDifference).toLocaleString()}
                            </p>
                            <p className="text-sm">
                                {isIncrease ? '+' : '-'}{Math.abs(Number(percentageChange))}% change
                            </p>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Important:</strong> This price change will:
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                <li>Apply to <strong>new plots</strong> created after this change</li>
                                <li><strong>NOT affect</strong> existing allocations or sold plots</li>
                                <li><strong>NOT affect</strong> plots with custom pricing</li>
                                <li>Be logged in the audit trail</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
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
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Confirm Price Change"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
