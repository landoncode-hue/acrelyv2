import { SystemGuide } from "@/components/guide/system-guide";

export default function PortalGuidePage() {
    return (
        <div className="container py-8 max-w-7xl mx-auto flex flex-col gap-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">System Guide</h1>
                <p className="text-muted-foreground">Everything you need to know about using Acrely.</p>
            </div>
            <SystemGuide />
        </div>
    );
}
