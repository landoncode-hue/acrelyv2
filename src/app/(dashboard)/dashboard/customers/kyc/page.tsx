import { CustomerService } from "@/lib/services/CustomerService";
import { PageHeader } from "@/components/layout/page-header";
import { KycRequestsTable } from "@/components/customers/KycRequestsTable";

export const dynamic = 'force-dynamic';

export default async function AdminKycPage() {
    const service = new CustomerService();
    const customers = await service.getKycRequests();

    return (
        <div className="space-y-8">
            <PageHeader
                title="KYC Management"
                description="Review and verify customer identity documents."
            />
            <KycRequestsTable initialCustomers={customers || []} />
        </div>
    );
}
