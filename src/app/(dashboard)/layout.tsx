import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { ContextPanelProvider } from "@/components/layout/context-panel";
import { ImpersonationBanner } from "@/components/staff/impersonation-banner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Simplified layout for fixed sidebar.
    // Sidebar component is 'fixed w-64', so we just need a main container with 'md:ml-64'.
    return (
        <ContextPanelProvider>
            <div className="min-h-screen w-full bg-muted/40">
                <ImpersonationBanner />
                <Sidebar />
                <div className="flex flex-col md:ml-64 transition-[margin] duration-300 ease-in-out">
                    <Navbar />
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </main>
                </div>
            </div>
        </ContextPanelProvider>
    );
}
