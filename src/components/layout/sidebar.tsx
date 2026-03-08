"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";
import {
    LayoutDashboard,
    Building2,
    Users,
    Briefcase,
    UserCheck,
    FileText,
    Settings,
    ShieldAlert,
    Wallet,
    LogOut,
    Menu,
    Map,
    Banknote,
    MessageSquare,
    Percent,
    UserCog,
    ScrollText,
    BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutAction } from "@/lib/actions/auth-actions";

type MenuItem = {
    title: string;
    href: string;
    icon: any;
    roles: string[];
    section?: string;
};

// Section definitions
const SECTIONS = {
    MAIN: "MAIN",
    SALES: "SALES",
    ADMIN: "ADMIN",
    CUSTOMER: "CUSTOMER"
};

const menuItems: MenuItem[] = [
    // MAIN section
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["sysadmin", "ceo", "md", "frontdesk", "agent", "customer"],
        section: SECTIONS.MAIN,
    },
    {
        title: "Communications",
        href: "/dashboard/communications",
        icon: MessageSquare,
        roles: ["sysadmin", "ceo", "md", "frontdesk", "agent"],
        section: SECTIONS.MAIN,
    },
    {
        title: "System Guide",
        href: "/dashboard/guide",
        icon: BookOpen,
        roles: ["sysadmin", "ceo", "md", "frontdesk", "agent"],
        section: SECTIONS.MAIN,
    },
    {
        title: "Support Tickets",
        href: "/dashboard/support",
        icon: MessageSquare,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.MAIN,
    },
    // SALES section
    {
        title: "Estates",
        href: "/dashboard/estates",
        icon: Map,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.SALES,
    },
    {
        title: "Allocations",
        href: "/dashboard/allocations",
        icon: ScrollText,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.SALES,
    },
    {
        title: "Customers",
        href: "/dashboard/customers",
        icon: Users,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.SALES,
    },
    {
        title: "Payments",
        href: "/dashboard/payments",
        icon: Banknote,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.SALES,
    },
    {
        title: "Leads",
        href: "/dashboard/leads",
        icon: Briefcase,
        roles: ["sysadmin", "ceo", "md", "frontdesk", "agent"],
        section: SECTIONS.SALES,
    },
    {
        title: "Apartments",
        href: "/dashboard/apartments",
        icon: Building2,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.SALES,
    },
    {
        title: "Appointments",
        href: "/dashboard/appointments",
        icon: UserCheck,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.SALES,
    },
    {
        title: "Commissions",
        href: "/dashboard/commissions",
        icon: Percent,
        roles: ["agent"],
        section: SECTIONS.SALES,
    },
    // ADMIN section
    {
        title: "Agents",
        href: "/dashboard/agents",
        icon: UserCog,
        roles: ["sysadmin", "ceo", "md"],
        section: SECTIONS.ADMIN,
    },
    {
        title: "Staff",
        href: "/dashboard/staff",
        icon: UserCheck,
        roles: ["sysadmin", "ceo", "md"],
        section: SECTIONS.ADMIN,
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.ADMIN,
    },
    {
        title: "Audit Logs",
        href: "/dashboard/audit",
        icon: ShieldAlert,
        roles: ["sysadmin", "ceo", "md"],
        section: SECTIONS.ADMIN,
    },
    {
        title: "Withdrawals",
        href: "/dashboard/commissions/withdrawals",
        icon: Banknote,
        roles: ["sysadmin", "ceo", "md"],
        section: SECTIONS.ADMIN,
    },
    {
        title: "KYC Management",
        href: "/dashboard/customers/kyc",
        icon: UserCheck,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        section: SECTIONS.ADMIN,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        roles: ["sysadmin", "ceo", "md", "frontdesk", "agent"],
        section: SECTIONS.ADMIN,
    },
    // CUSTOMER section (portal users)
    {
        title: "My Properties",
        href: "/portal/properties",
        icon: Map,
        roles: ["customer"],
        section: SECTIONS.CUSTOMER,
    },
    {
        title: "Payments",
        href: "/portal/payments",
        icon: Wallet,
        roles: ["customer"],
        section: SECTIONS.CUSTOMER,
    },
    {
        title: "KYC Verification",
        href: "/portal/kyc",
        icon: UserCheck,
        roles: ["customer"],
        section: SECTIONS.CUSTOMER,
    },
    {
        title: "Settings",
        href: "/portal/settings",
        icon: Settings,
        roles: ["customer"],
        section: SECTIONS.CUSTOMER,
    },
    {
        title: "System Guide",
        href: "/portal/guide",
        icon: BookOpen,
        roles: ["customer"],
        section: SECTIONS.CUSTOMER,
    }
];

const SidebarContent = ({ filteredItems, pathname, handleSignOut, isLoading, setIsOpen }: {
    filteredItems: MenuItem[],
    pathname: string,
    handleSignOut: () => void,
    isLoading: boolean,
    setIsOpen: (open: boolean) => void
}) => {
    return (
        <div className="flex h-full flex-col gap-2 bg-background border-r border-border/40 text-foreground">
            <div className="flex h-16 items-center border-b border-border/40 px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <img src="/logo.svg" alt="Acrely Logo" className="h-8 w-auto" />
                    <span className="text-xl font-bold tracking-tight text-foreground">Acrely</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4 px-3">
                <nav className="grid items-start gap-1">
                    {isLoading ? (
                        <div className="space-y-1">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                            <div className="pt-4 pb-1 px-3">
                                <Skeleton className="h-2.5 w-12" />
                            </div>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={`s2-${i}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                                    <Skeleton className="h-4 w-4 rounded" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        Object.entries(
                            filteredItems.reduce((acc, item) => {
                                const section = item.section || SECTIONS.MAIN;
                                if (!acc[section]) acc[section] = [];
                                acc[section].push(item);
                                return acc;
                            }, {} as Record<string, MenuItem[]>)
                        ).map(([section, items]) => (
                            <div key={section} className="space-y-1">
                                {section !== SECTIONS.MAIN && section !== SECTIONS.CUSTOMER && (
                                    <div className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-3 pt-4 pb-1">
                                        {section}
                                    </div>
                                )}
                                {items.map((item, index) => {
                                    const Icon = item.icon;
                                    const isExact = pathname === item.href;
                                    const isSubPath = pathname.startsWith(item.href + "/");
                                    const isActive = item.href === "/dashboard"
                                        ? isExact
                                        : (isExact || isSubPath);

                                    return (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                            {item.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </nav>
            </div>
            <div className="shrink-0 border-t border-border/40 p-4">
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export function Sidebar() {
    const pathname = usePathname();
    const { profile, loading } = useProfile();
    const [isOpen, setIsOpen] = useState(false);

    // Prevent layout shift by returning the shell even if loading
    const isLoading = loading || !profile;

    const filteredItems = menuItems.filter((item) =>
        profile && item.roles.includes(profile.role)
    );


    const handleSignOut = async () => {
        await logoutAction();
    };

    const navProps = { filteredItems, pathname, handleSignOut, isLoading, setIsOpen };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden fixed left-4 top-4 z-50 bg-background/80 backdrop-blur-sm shadow-sm">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-64 border-r border-border bg-background">
                    <SidebarContent {...navProps} />
                </SheetContent>
            </Sheet>

            <div className="hidden border-r border-border bg-background/50 md:block w-64 fixed inset-y-0 z-30 backdrop-blur-xl">
                <SidebarContent {...navProps} />
            </div>
        </>
    );
}
