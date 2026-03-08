import { CustomerService } from "@/lib/services/CustomerService";
import { CustomerProfileView } from "@/components/customers/CustomerProfileView";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Customer Profile | Acrely",
};

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customerService = new CustomerService();

    const result = await customerService.getCustomerDetails(id);

    if (!result || !result.customer) {
        notFound();
    }

    const { customer, allocations, payments, interactions, documents, notes } = result;

    return (
        <CustomerProfileView
            customer={customer}
            allocations={allocations}
            payments={payments}
            interactions={interactions}
            documents={documents}
            initialNotes={notes}
        />
    );
}
