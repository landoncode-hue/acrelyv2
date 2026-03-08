import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getAvatarUrl(seed: string, url?: string | null) {
    if (url) return url;
    // Using 'glass' style as requested
    return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed || 'default')}`;
}

export function formatAuditAction(log: Record<string, unknown>) {
    const actor = (log.profiles as Record<string, unknown>)?.full_name || (log.actor as Record<string, unknown>)?.full_name || 'System';
    const action = (log.action_type as string)?.toLowerCase();
    const target = (log.target_type as string)?.toLowerCase();
    const changes = log.changes as Record<string, unknown> | undefined;

    // Basic formatting
    let verb = action;
    if (action === 'create') verb = 'created new';
    if (action === 'update') verb = 'updated';
    if (action === 'delete') verb = 'deleted';
    if (action === 'login') verb = 'logged in';

    // Enhance with details if available
    let suffix = "";
    if (target === 'estate' && changes?.name) suffix = ` "${changes.name}"`;
    if (target === 'payment' && changes?.amount) suffix = ` of ${formatCurrency(changes.amount as number)}`;

    return `${actor} ${verb} ${target}${suffix}`;
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount);
}

export * from "./analytics-utils";
export * from "./csv-utils";
export * from "./phone";
export * from "./plot";
export * from "./responsive-text";
