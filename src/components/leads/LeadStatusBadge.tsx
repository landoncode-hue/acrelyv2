import { Badge } from "@/components/ui/badge";
import {
    Circle,
    Phone,
    CheckCircle2,
    UserCheck,
    XCircle
} from "lucide-react";
import { LeadStatus } from "@/lib/repositories/types";

interface LeadStatusBadgeProps {
    status: LeadStatus;
    className?: string;
}

const statusConfig: Record<LeadStatus, {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
    icon: React.ReactNode;
    className: string;
}> = {
    new: {
        label: "New",
        variant: "default",
        icon: <Circle className="h-3 w-3 fill-current" />,
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
    },
    contacted: {
        label: "Contacted",
        variant: "secondary",
        icon: <Phone className="h-3 w-3" />,
        className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    },
    qualified: {
        label: "Qualified",
        variant: "outline",
        icon: <CheckCircle2 className="h-3 w-3" />,
        className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
    },
    converted: {
        label: "Converted",
        variant: "success",
        icon: <UserCheck className="h-3 w-3" />,
        className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    },
    lost: {
        label: "Lost",
        variant: "destructive",
        icon: <XCircle className="h-3 w-3" />,
        className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    },
    proposal: {
        label: "Proposal",
        variant: "outline",
        icon: <CheckCircle2 className="h-3 w-3" />,
        className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
    },
    negotiation: {
        label: "Negotiation",
        variant: "secondary",
        icon: <Phone className="h-3 w-3" />,
        className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
    }
};

export function LeadStatusBadge({ status, className = "" }: LeadStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.new;

    return (
        <Badge
            variant={config.variant}
            className={`flex items-center gap-1.5 ${config.className} ${className}`}
        >
            {config.icon}
            <span>{config.label}</span>
        </Badge>
    );
}
