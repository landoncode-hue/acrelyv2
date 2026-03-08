"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    className?: string;
}

// Route label mappings
const ROUTE_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    estates: "Estates",
    allocations: "Allocations",
    pending: "Pending Approvals",
    customers: "Customers",
    payments: "Payments",
    leads: "Leads",
    agents: "Agents",
    staff: "Staff",
    reports: "Reports",
    audit: "Audit Logs",
    settings: "Settings",
    communications: "Communications",
    support: "Support Tickets",
    commissions: "Commissions",
    withdrawals: "Withdrawals",
    kyc: "KYC Management",
    new: "New",
    analytics: "Analytics",
    portal: "Portal",
    properties: "Properties",
    documents: "Documents",
};

/**
 * Auto-generates breadcrumbs from the current URL path
 * Can also accept custom items for override
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    const pathname = usePathname();

    // Auto-generate from pathname if no items provided
    const breadcrumbItems: BreadcrumbItem[] = items || (() => {
        const segments = pathname.split('/').filter(Boolean);
        const generatedItems: BreadcrumbItem[] = [];

        segments.forEach((segment, index) => {
            // Skip dynamic segments (UUIDs)
            if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                generatedItems.push({ label: "Details" });
                return;
            }

            const href = '/' + segments.slice(0, index + 1).join('/');
            const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

            // Last item shouldn't be a link
            if (index === segments.length - 1) {
                generatedItems.push({ label });
            } else {
                generatedItems.push({ label, href });
            }
        });

        return generatedItems;
    })();

    if (breadcrumbItems.length <= 1) return null;

    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-muted-foreground mb-4", className)}>
            <ol className="flex items-center gap-1.5 flex-wrap">
                {breadcrumbItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-1.5">
                        {index > 0 && (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-foreground transition-colors"
                            >
                                {index === 0 && item.label === "Dashboard" ? (
                                    <span className="flex items-center gap-1">
                                        <Home className="h-3.5 w-3.5" />
                                        <span className="sr-only">Dashboard</span>
                                    </span>
                                ) : (
                                    item.label
                                )}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
