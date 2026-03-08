import EstateDetailClient from "./estate-detail-client";
import { EstateService } from "@/lib/services/EstateService";
import { ProfileService } from "@/lib/services/ProfileService";
import { getCurrentUser } from "@/lib/auth/session";
import { notFound } from "next/navigation";

interface EstateDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

const estateService = new EstateService();
const profileService = new ProfileService();

export default async function EstateDetailPage({ params }: EstateDetailPageProps) {
    const { id } = await params;
    const user = await getCurrentUser();

    let role = null;
    if (user) {
        const profile = await profileService.getProfile(user.id);
        role = profile?.role;
    }

    const { estate, plots, allocations, analytics } = await estateService.getEstateDetails(id);

    if (!estate) {
        return notFound();
    }

    // Process data for formatting
    // Natural sort for plots
    const sortedPlots = plots.sort((a, b) =>
        a.plot_number.localeCompare(b.plot_number, undefined, { numeric: true, sensitivity: 'base' })
    );

    // Flatten allocations
    const flatAlloc = allocations.map((a: any) => ({
        id: a.id,
        customer_id: a.customers?.id,
        customer_name: a.customers?.full_name || 'Unknown',
        customer_phone: a.customers?.phone || '-',
        customer_email: a.customers?.email || '-',
        plot_number: a.plots?.plot_number || 'N/A',
        additional_plot_ids: a.additional_plot_ids || [],
        status: a.status,
        created_at: a.created_at
    }));

    return (
        <EstateDetailClient
            initialEstate={estate}
            initialPlots={sortedPlots}
            initialAllocations={flatAlloc}
            analytics={analytics}
            userRole={role}
        />
    );
}
