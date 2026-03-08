import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, AlertCircle, FileText, Ban, Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
    status: string;
    showIcon?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: ReactNode }> = {
    // Positive states
    active: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
    approved: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
    verified: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
    completed: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
    paid: { bg: "bg-green-50 border-green-200", text: "text-green-700", icon: <CheckCircle className="h-3 w-3" /> },

    // Pending states
    pending: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", icon: <Clock className="h-3 w-3" /> },
    draft: { bg: "bg-slate-50 border-slate-200", text: "text-slate-700", icon: <FileText className="h-3 w-3" /> },
    processing: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", icon: <Loader2 className="h-3 w-3 animate-spin" /> },

    // Warning states
    overdue: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: <AlertCircle className="h-3 w-3" /> },
    expired: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: <AlertCircle className="h-3 w-3" /> },

    // Negative states
    rejected: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <XCircle className="h-3 w-3" /> },
    cancelled: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <Ban className="h-3 w-3" /> },
    revoked: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <Ban className="h-3 w-3" /> },
    failed: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <XCircle className="h-3 w-3" /> },
    inactive: { bg: "bg-slate-100 border-slate-300", text: "text-slate-500", icon: <Ban className="h-3 w-3" /> },
};

const DEFAULT_CONFIG = { bg: "bg-slate-50 border-slate-200", text: "text-slate-700", icon: null };

/**
 * StatusChip - An accessible status indicator that includes both color AND icon
 * to ensure users who can't distinguish colors can still understand the status.
 */
export function StatusChip({ status, showIcon = true, className, ...props }: StatusChipProps) {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, '');
    const config = STATUS_CONFIG[normalizedStatus] || DEFAULT_CONFIG;
    const displayText = status.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
                config.bg,
                config.text,
                className
            )}
            {...props}
        >
            {showIcon && config.icon}
            <span>{displayText}</span>
        </span>
    );
}
