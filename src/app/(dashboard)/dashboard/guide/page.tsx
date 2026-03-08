import { SystemGuide } from "@/components/guide/system-guide";
import { PageHeader } from "@/components/layout/page-header";

export default function DashboardGuidePage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Acrely Guide"
                description="Your complete manual for system operations and business workflows"
            />
            <SystemGuide />
        </div>
    );
}
