"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, List, Layers, Settings, Send } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";

const tabs = [
    { name: "Overview", href: "/dashboard/communications", icon: BarChart3 },
    { name: "Campaigns", href: "/dashboard/communications/campaigns", icon: Send },
    { name: "Logs", href: "/dashboard/communications/logs", icon: List },
    { name: "Templates", href: "/dashboard/communications/templates", icon: Layers },
    { name: "Settings", href: "/dashboard/communications/settings", icon: Settings },
];

export default function CommunicationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Communication Engine"
                description="Manage SMS, Email, and In-App messaging for customers and agents."
            />

            <div>
                <div className="inline-flex h-10 items-center rounded-lg bg-muted p-1 text-muted-foreground">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href || (tab.href !== "/dashboard/communications" && pathname?.startsWith(tab.href));
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                    isActive
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                            >
                                <tab.icon className="hidden mr-2 h-4 w-4 sm:inline-block" />
                                {tab.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="min-h-[calc(100vh-200px)]">
                {children}
            </div>
        </div>
    );
}
