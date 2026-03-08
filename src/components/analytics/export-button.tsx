"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
    onExport: () => Promise<void>;
    label?: string;
    disabled?: boolean;
    className?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({
    onExport,
    label = "Export CSV",
    disabled = false,
    className,
    variant = "outline",
    size = "default",
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await onExport();
            toast.success("Export completed successfully");
        } catch (error: any) {
            console.error("Export error:", error);
            toast.error(error.message || "Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={disabled || isExporting}
            variant={variant}
            size={size}
            className={cn("gap-2", className)}
        >
            {isExporting ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4" />
                    {label}
                </>
            )}
        </Button>
    );
}
