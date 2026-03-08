"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createPlotAction } from "@/lib/actions/estate-actions";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";
import { isValidPlotNumber, isHalfPlot, getDefaultDimensions } from "@/lib/utils/plot";

interface Plot {
    id: string;
    estate_id: string;
    plot_number: string;
    dimensions: string;
    status: string;
}

interface AddPlotDialogProps {
    estateId: string;
    onPlotAdded: (plot: Plot) => void;
}

export function AddPlotDialog({ estateId, onPlotAdded }: AddPlotDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [plotNumber, setPlotNumber] = useState("");
    const [dimensions, setDimensions] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    // Auto-calculate dimensions and validate plot number
    useEffect(() => {
        if (!plotNumber) {
            setDimensions("");
            setValidationError(null);
            return;
        }

        // Validate format
        if (!isValidPlotNumber(plotNumber)) {
            setValidationError("Invalid format. Use numbers like 1, 2, 15 or half plots like 1A, 1B, 15A, 15B");
            setDimensions("");
            return;
        }

        setValidationError(null);
        setDimensions(getDefaultDimensions(plotNumber));
    }, [plotNumber]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!plotNumber || !dimensions) {
            toast.error("Please fill all fields");
            return;
        }

        if (!isValidPlotNumber(plotNumber)) {
            toast.error("Invalid plot number format");
            return;
        }

        setLoading(true);
        try {
            const result = await createPlotAction({
                estateId,
                plotNumber: plotNumber.toUpperCase(),
                dimensions,
                status: 'available'
            });

            if (!result.success || !result.data) {
                const errorMsg = result.error?.message || "Failed to add plot";
                throw new Error(errorMsg);
            }

            toast.success(`Plot ${plotNumber.toUpperCase()} added successfully`);
            onPlotAdded((result.data as any) as Plot);
            setOpen(false);
            setPlotNumber("");
            setDimensions("");
        } catch (error: any) {
            const message = error instanceof Error ? error.message : "Failed to add plot";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const isHalf = plotNumber && isValidPlotNumber(plotNumber) && isHalfPlot(plotNumber);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Plot
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Plot</DialogTitle>
                    <DialogDescription>
                        Enter the plot number. Use A/B suffix for half plots (e.g., 1A, 1B).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="plotNumber">Plot Number</Label>
                            {isHalf && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    Half Plot
                                </Badge>
                            )}
                        </div>
                        <Input
                            id="plotNumber"
                            value={plotNumber}
                            onChange={e => setPlotNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. 15 or 15A"
                            autoFocus
                            className={validationError ? "border-red-300 focus-visible:ring-red-300" : ""}
                        />
                        {validationError ? (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {validationError}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Full plots: 1, 2, 15 • Half plots: 1A, 1B, 15A, 15B
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dimensions">Dimensions</Label>
                        <Input
                            id="dimensions"
                            value={dimensions}
                            onChange={e => setDimensions(e.target.value)}
                            placeholder="100ftx100ft"
                        />
                        <p className="text-xs text-muted-foreground">
                            Auto-set: Full = 100ftx100ft, Half = 50ftx100ft
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading || !!validationError || !plotNumber}
                        >
                            {loading ? "Adding..." : "Add Plot"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
