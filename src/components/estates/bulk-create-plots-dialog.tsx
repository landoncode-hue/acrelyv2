"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkPlotConflictsAction, bulkCreatePlotsAction } from "@/lib/actions/estate-actions";

interface BulkCreatePlotsDialogProps {
    estateId: string;
    estateName?: string;
    onPlotsCreated: (plots: any[]) => void;
}

interface PlotPreview {
    plot_number: string;
    size: string;
    price: number;
    status: 'ready' | 'conflict' | 'error';
    message?: string;
}

export function BulkCreatePlotsDialog({ estateId, estateName, onPlotsCreated }: BulkCreatePlotsDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [prefix, setPrefix] = useState("");
    const [startNumber, setStartNumber] = useState("");
    const [endNumber, setEndNumber] = useState("");
    const [defaultPrice, setDefaultPrice] = useState("");
    const [defaultSize, setDefaultSize] = useState("100ft x 100ft");
    const [preview, setPreview] = useState<PlotPreview[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const generatePreview = async () => {
        if (!startNumber || !endNumber) {
            toast.error("Please enter start and end numbers");
            return;
        }

        const start = parseInt(startNumber);
        const end = parseInt(endNumber);

        if (isNaN(start) || isNaN(end) || start > end) {
            toast.error("Invalid number range");
            return;
        }

        if (end - start > 500) {
            toast.error("Maximum 500 plots per batch");
            return;
        }

        setLoading(true);

        try {
            // Generate plot numbers
            const plotNumbers = [];
            for (let i = start; i <= end; i++) {
                plotNumbers.push(prefix ? `${prefix}${i}` : `${i}`);
            }

            // Check for conflicts with existing plots
            const result = await checkPlotConflictsAction({
                estateId,
                plotNumbers
            });

            if (!result.success) throw new Error(result.error as string);

            const existingNumbers = new Set(result.data?.conflicts || []);

            // Create preview
            const previews: PlotPreview[] = plotNumbers.map(plotNumber => {
                const hasConflict = existingNumbers.has(plotNumber);
                return {
                    plot_number: plotNumber,
                    size: defaultSize,
                    price: defaultPrice ? parseFloat(defaultPrice) : 0,
                    status: hasConflict ? 'conflict' : 'ready',
                    message: hasConflict ? 'Already exists' : undefined
                };
            });

            setPreview(previews);
            setShowPreview(true);

        } catch (error: any) {
            toast.error(error.message || "Failed to generate preview");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        const readyPlots = preview.filter(p => p.status === 'ready');

        if (readyPlots.length === 0) {
            toast.error("No plots to create");
            return;
        }

        setLoading(true);
        try {
            const plotsToInsert = readyPlots.map(p => ({
                estate_id: estateId,
                plot_number: p.plot_number,
                size: p.size,
                price: p.price || null,
                status: 'available'
            }));

            const result = await bulkCreatePlotsAction({
                estateId,
                plots: plotsToInsert,
                auditLog: {
                    action_type: "BULK_CREATE_PLOTS",
                    target_id: estateId,
                    target_type: "estates",
                    changes: {
                        count: plotsToInsert.length,
                        prefix: prefix,
                        range: `${startNumber}-${endNumber}`
                    }
                }
            });

            if (result.success) {
                toast.success(`Successfully created ${result.data?.count} plots`);
                // The parent component refreshes data anyway.
                onPlotsCreated(plotsToInsert);
                setOpen(false);
                resetForm();
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to create plots";
                throw new Error(errorMessage);
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to create plots");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setPrefix("");
        setStartNumber("");
        setEndNumber("");
        setDefaultPrice("");
        setDefaultSize("100ft x 100ft");
        setPreview([]);
        setShowPreview(false);
    };

    const conflictCount = preview.filter(p => p.status === 'conflict').length;
    const readyCount = preview.filter(p => p.status === 'ready').length;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Bulk Create Plots
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Create Plots</DialogTitle>
                    <DialogDescription>
                        Create multiple plots at once for {estateName || 'this estate'}
                    </DialogDescription>
                </DialogHeader>

                {!showPreview ? (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="prefix">Prefix (Optional)</Label>
                                <Input
                                    id="prefix"
                                    value={prefix}
                                    onChange={e => setPrefix(e.target.value)}
                                    placeholder="e.g., A, Block-1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Example: "A" → A1, A2, A3...
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="defaultSize">Default Size</Label>
                                <Input
                                    id="defaultSize"
                                    value={defaultSize}
                                    onChange={e => setDefaultSize(e.target.value)}
                                    placeholder="e.g., 100ft x 100ft"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startNumber">Start Number *</Label>
                                <Input
                                    id="startNumber"
                                    type="number"
                                    value={startNumber}
                                    onChange={e => setStartNumber(e.target.value)}
                                    placeholder="1"
                                    min="1"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endNumber">End Number *</Label>
                                <Input
                                    id="endNumber"
                                    type="number"
                                    value={endNumber}
                                    onChange={e => setEndNumber(e.target.value)}
                                    placeholder="40"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="defaultPrice">Default Price (Optional)</Label>
                            <Input
                                id="defaultPrice"
                                type="number"
                                value={defaultPrice}
                                onChange={e => setDefaultPrice(e.target.value)}
                                placeholder="Leave empty to use estate price"
                            />
                        </div>

                        <Button onClick={generatePreview} disabled={loading} className="w-full">
                            {loading ? "Generating Preview..." : "Generate Preview"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">
                                    Preview: {preview.length} plots
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {readyCount} ready to create, {conflictCount} conflicts
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                                Edit
                            </Button>
                        </div>

                        {conflictCount > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {conflictCount} plot number{conflictCount > 1 ? 's' : ''} already exist and will be skipped
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="border rounded-md max-h-[400px] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plot Number</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {preview.map((plot, idx) => (
                                        <TableRow key={idx} className={plot.status === 'conflict' ? 'bg-destructive/10' : ''}>
                                            <TableCell className="font-medium">{plot.plot_number}</TableCell>
                                            <TableCell>{plot.size}</TableCell>
                                            <TableCell>₦{plot.price.toLocaleString()}</TableCell>
                                            <TableCell>
                                                {plot.status === 'ready' ? (
                                                    <span className="text-green-600 text-sm">Ready</span>
                                                ) : (
                                                    <span className="text-destructive text-sm">{plot.message}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {showPreview && (
                        <Button onClick={handleSubmit} disabled={loading || readyCount === 0}>
                            {loading ? "Creating..." : `Create ${readyCount} Plot${readyCount !== 1 ? 's' : ''}`}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
