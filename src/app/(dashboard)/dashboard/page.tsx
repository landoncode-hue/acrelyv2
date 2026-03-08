import { redirect } from "next/navigation";
import { CeoDashboard } from "@/components/dashboard/ceo-dashboard";
import { FrontDeskDashboard } from "@/components/dashboard/front-desk-dashboard";
import { AgentDashboard } from "@/components/dashboard/agent-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { getExecutiveKPIs, getFrontdeskMetrics, getRevenueTrends, getAgentSelfMetrics } from "@/lib/actions/analytics-actions";
import { getCurrentUser } from "@/lib/auth/session";
import { ProfileService } from "@/lib/services/ProfileService";

const profileService = new ProfileService();

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await profileService.getProfile(user.id);

    if (!profile) {
        return <div>Access Denied. Profile not found.</div>;
    }

    // Role-based routing & Data Prefetching
    if (profile.role === 'customer') {
        redirect('/portal');
    }

    if (['ceo', 'md', 'sysadmin'].includes(profile.role)) {
        // Parallel fetch for CEO
        const [kpiRes, frontdeskRes, trendsRes] = await Promise.all([
            getExecutiveKPIs(),
            getFrontdeskMetrics(),
            getRevenueTrends('monthly')
        ]);

        return <CeoDashboard
            profile={profile}
            initialData={{
                kpi: kpiRes.data,
                frontdesk: frontdeskRes.data,
                trends: trendsRes.data
            }}
        />;
    }

    if (profile.role === 'frontdesk') {
        const metricsRes = await getFrontdeskMetrics();
        return <FrontDeskDashboard
            profile={profile}
            initialData={{
                metrics: metricsRes.data
            }}
        />;
    }

    if (profile.role === 'agent') {
        const metricsRes = await getAgentSelfMetrics(profile.id);
        return <AgentDashboard
            profile={profile}
            initialData={{
                metrics: metricsRes.data
            }}
        />;
    }

    // Fallback for other roles until specific dashboards are built
    return (
        <div className="space-y-8">
            <PageHeader title={`Dashboard (${profile.role})`} description={`Welcome, ${profile.full_name}`} />
            <div className="rounded-lg border border-dashed p-8 text-center bg-muted/50">
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="text-muted-foreground">The dashboard for {profile.role} is currently under construction.</p>
            </div>
        </div>
    );
}
