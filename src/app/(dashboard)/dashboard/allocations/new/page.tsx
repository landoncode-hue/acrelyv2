import { AllocationWizard } from "@/components/allocations/wizard/allocation-wizard";
import { CustomerService } from "@/lib/services/CustomerService";
import { EstateService } from "@/lib/services/EstateService";

interface NewAllocationPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const customerService = new CustomerService();
const estateService = new EstateService();

export default async function NewAllocationPage(props: NewAllocationPageProps) {
    const searchParams = await props.searchParams;

    const customerId = searchParams.customerId as string;
    const estateId = searchParams.estate_id as string;
    const plotId = searchParams.plot_id as string;

    let initialData: any = {};

    if (customerId) {
        const customer = await customerService.getById(customerId);
        if (customer) {
            initialData.customerId = customer.id;
            initialData.customerName = customer.full_name;
        }
    }

    if (estateId) {
        const estate = await estateService.getById(estateId);
        if (estate) {
            initialData.estateId = estate.id;
            initialData.estateName = estate.name;
        }
    }

    if (plotId) {
        initialData.plotId = plotId;
    }

    return (
        <div className="container py-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Allocation</h1>
            <AllocationWizard prefilledData={initialData} />
        </div>
    );
}
