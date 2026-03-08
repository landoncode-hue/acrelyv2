"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2, Archive, PauseCircle } from "lucide-react";

interface EstateStatusBadgeProps {
    status: "active" | "inactive" | "archived";
    className?: string;
    showIcon?: boolean;
}

export function EstateStatusBadge({
    status,
    className,
    showIcon = true
}: EstateStatusBadgeProps) {
    const config = {
        active: {
            label: "Active",
            variant: "default" as const,
            icon: Building2,
            className: "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20"
        },
        inactive: {
            label: "Inactive",
            variant: "secondary" as const,
            icon: PauseCircle,
            className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20"
        },
        archived: {
            label: "Archived",
            variant: "outline" as const,
            icon: Archive,
            className: "bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20"
        }
    };

    const { label, icon: Icon, className: statusClassName } = config[status] || config.active;

    return (
        <Badge
            variant="outline"
            className={cn(statusClassName, className)}
        >
            {showIcon && <Icon className="h-3 w-3 mr-1" />}
            {label}
        </Badge>
    );
}
