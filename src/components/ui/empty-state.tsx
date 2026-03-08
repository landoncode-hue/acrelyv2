import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300", className)}>
            {Icon && (
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-muted-foreground/50" />
                </div>
            )}
            <h3 className="text-lg font-semibold tracking-tight mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>

            {actionLabel && (
                actionHref ? (
                    <Button asChild>
                        <Link href={actionHref}>{actionLabel}</Link>
                    </Button>
                ) : onAction ? (
                    <Button onClick={onAction}>{actionLabel}</Button>
                ) : null
            )}
        </div>
    );
}
