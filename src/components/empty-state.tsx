import { LucideIcon, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import Link from "next/link";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    children?: ReactNode;
}

export function EmptyState({
    title = "No items found",
    description = "There are no items to display at this time.",
    icon: Icon = FileX,
    actionLabel,
    actionHref,
    onAction,
    children
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-gray-50/50 border-dashed animate-in fade-in-50 zoom-in-95 duration-500">
            <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gray-100">
                <Icon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight mb-2 text-gray-900">{title}</h3>
            <p className="max-w-sm mb-8 text-sm text-gray-500 leading-relaxed">{description}</p>
            {children}
            {actionLabel && (
                <>
                    {actionHref ? (
                        <Button asChild>
                            <Link href={actionHref}>{actionLabel}</Link>
                        </Button>
                    ) : onAction ? (
                        <Button onClick={onAction}>{actionLabel}</Button>
                    ) : null}
                </>
            )}
        </div>
    );
}
