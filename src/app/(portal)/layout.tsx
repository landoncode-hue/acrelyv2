"use client";

import { useProfile } from "@/hooks/use-profile";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MapPin, CreditCard, FileText, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarContentProps {
    items: { icon: any; label: string; href: string }[];
    pathname: string;
    profile: any;
    setSidebarOpen: (open: boolean) => void;
    handleSignOut: () => void;
}

const SidebarContent = ({ items, pathname, profile, setSidebarOpen, handleSignOut }: SidebarContentProps) => (
    <>
        <div className="flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="Acrely" className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight text-black">Acrely Portal</span>
        </div>

        <nav className="space-y-2 flex-1">
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                            isActive ? "bg-brand-purple/10 text-brand-purple font-medium" : "text-muted-foreground hover:bg-muted"
                        )}>
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </div>
                    </Link>
                )
            })}
        </nav>

        <div className="pt-6 border-t flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">Customer</p>
                </div>
            </div>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
        </div>
    </>
);

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const { profile, loading } = useProfile();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) return null; // Or skeleton

    const sidebarItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/portal" },
        { icon: MapPin, label: "My Allocations", href: "/portal/allocations" },
        { icon: CreditCard, label: "Payments", href: "/portal/payments" },
        { icon: FileText, label: "Documents", href: "/portal/documents" },
    ];

    const handleSignOut = async () => {
        router.push("/login");
    }

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Mobile Header */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden fixed left-4 top-4 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-6 flex flex-col">
                    <SidebarContent
                        items={sidebarItems}
                        pathname={pathname}
                        profile={profile}
                        setSidebarOpen={setSidebarOpen}
                        handleSignOut={handleSignOut}
                    />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-white p-6 hidden md:flex md:flex-col">
                <SidebarContent
                    items={sidebarItems}
                    pathname={pathname}
                    profile={profile}
                    setSidebarOpen={setSidebarOpen}
                    handleSignOut={handleSignOut}
                />
            </aside>


            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-6 md:p-10">
                <div className="max-w-5xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
