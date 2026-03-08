import { PageHeader } from "@/components/layout/page-header";
import { ApartmentForm } from "@/components/apartments/ApartmentForm";
import { Card, CardContent } from "@/components/ui/card";

export default function NewApartmentPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Add New Apartment"
                description="Create a new apartment listing with details, amenities, and media."
                backHref="/dashboard/apartments"
            />

            <Card>
                <CardContent className="pt-6">
                    <ApartmentForm />
                </CardContent>
            </Card>
        </div>
    );
}
