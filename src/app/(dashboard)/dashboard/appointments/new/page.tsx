import { ApartmentService } from "@/lib/services/ApartmentService";
import { CustomerService } from "@/lib/services/CustomerService";
import { PageHeader } from "@/components/layout/page-header";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";
import { Card, CardContent } from "@/components/ui/card";

const apartmentService = new ApartmentService();
const customerService = new CustomerService();

export default async function NewAppointmentPage({
    searchParams
}: {
    searchParams: Promise<{ customerId?: string; apartmentId?: string }>
}) {
    const { customerId, apartmentId } = await searchParams;

    // Fetch apartments and customers for selection
    const [apartments, customers] = await Promise.all([
        apartmentService.getApartments(),
        customerService.getCustomersWithMetrics() // Using existing service method
    ]);

    // Format data for the form
    const formattedApartments = apartments.map(apt => ({ id: apt.id, name: apt.name }));
    const formattedCustomers = customers.map(cust => ({ id: cust.id, full_name: cust.full_name }));

    return (
        <div className="space-y-8">
            <PageHeader
                title="Schedule Appointment"
                description="Book a property viewing or visit for a customer."
                backHref="/dashboard/appointments"
            />

            <Card>
                <CardContent className="pt-6">
                    <AppointmentForm
                        apartments={formattedApartments}
                        customers={formattedCustomers}
                        initialData={{
                            customerId,
                            apartmentId
                        }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
