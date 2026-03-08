"use client";

import { usePathname } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/utils";
import { NotificationDropdown } from "@/components/communications/NotificationDropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
    const { profile, loading } = useProfile();
    const pathname = usePathname();

    const getPageTitle = (path: string) => {
        if (path === "/dashboard") return "Dashboard";
        if (path.startsWith("/dashboard/communications")) return "Communications";
        if (path === "/dashboard/notifications") return "Notifications";

        if (path === "/dashboard/estates") return "Estates";
        if (path === "/dashboard/estates/new") return "New Estate";
        if (path.startsWith("/dashboard/estates/")) return "Estate Details";

        if (path === "/dashboard/customers") return "Customers";
        if (path === "/dashboard/customers/new") return "New Customer";
        if (path.startsWith("/dashboard/customers/")) return "Customer Details";

        if (path === "/dashboard/payments") return "Payments";
        if (path === "/dashboard/payments/new") return "New Payment";
        if (path.startsWith("/dashboard/payments/")) return "Payment Details";

        if (path === "/dashboard/agents") return "Agents";
        if (path === "/dashboard/staff") return "Staff Management";
        if (path === "/dashboard/commissions") return "Commissions";

        if (path === "/dashboard/leads") return "Leads";
        if (path === "/dashboard/leads/new") return "New Lead";
        if (path.startsWith("/dashboard/leads/")) return "Lead Details";

        if (path === "/dashboard/reports") return "Reports";
        if (path === "/dashboard/audit") return "Audit Logs";
        if (path === "/dashboard/settings") return "Settings";

        if (path === "/dashboard/allocations") return "Allocations";
        if (path === "/dashboard/allocations/pending") return "Pending Approvals";
        if (path === "/dashboard/allocations/new") return "New Allocation";
        if (path.startsWith("/dashboard/allocations/")) return "Allocation Details";

        if (path === "/dashboard/support") return "Support Tickets";

        return "Acrely";
    };

    return (
        <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background/70 px-4 lg:h-[64px] lg:px-8 w-full sticky top-0 z-30 backdrop-blur-md shadow-xs">
            <h1 className="text-sm font-semibold md:text-lg text-foreground pl-12 md:pl-0 tracking-tight flex items-center gap-2">
                <span className="text-muted-foreground font-normal">/</span> {getPageTitle(pathname)}
            </h1>

            <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationDropdown />

                <div className="flex gap-4 items-center pl-2 border-l border-border/40" data-testid="user-menu">
                    {loading || !profile ? (
                        <>
                            <div className="hidden md:flex items-center gap-1.5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-14" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </>
                    ) : (
                        <>
                            <span className="text-sm font-medium text-muted-foreground hidden md:block">
                                {profile.full_name} <span className="text-xs opacity-70">({profile.role})</span>
                            </span>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={getAvatarUrl(profile.id, profile.avatar_url)} />
                                <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
