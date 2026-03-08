import { ApartmentService } from "@/lib/services/ApartmentService";
import { PageHeader } from "@/components/layout/page-header";
import { ApartmentForm } from "@/components/apartments/ApartmentForm";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";

const apartmentService = new ApartmentService();

export default async function EditApartmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const apartment = await apartmentService.getApartmentById(id);

    if (!apartment) {
        return notFound();
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title={`Edit ${apartment.name}`}
                description="Update apartment details, amenities, and media."
                backHref="/dashboard/apartments"
            />

            <Card>
                <CardContent className="pt-6">
                    <ApartmentForm initialData={apartment} />
                </CardContent>
            </Card>
        </div>
    );
}
