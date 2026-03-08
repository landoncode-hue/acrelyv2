import { ApartmentService } from "@/lib/services/ApartmentService";
import { ApartmentList } from "@/components/apartments/ApartmentList";
import { PageHeader } from "@/components/layout/page-header";

const apartmentService = new ApartmentService();

export default async function ApartmentsPage() {
    const apartments = await apartmentService.getApartments();

    return (
        <div className="space-y-8">
            <PageHeader
                title="Apartments"
                description="Manage your apartment listings, pricing, and availability."
            />
            <ApartmentList initialApartments={apartments} />
        </div>
    );
}
