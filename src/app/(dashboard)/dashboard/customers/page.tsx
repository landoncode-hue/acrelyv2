import { CustomerService } from "@/lib/services/CustomerService";
import CustomersTable, { CustomerWithMetrics } from "@/components/customers/CustomersTable";

export default async function CustomersPage() {
    const service = new CustomerService();

    const result = await service.getCustomersWithMetrics();
    const customers = (result as CustomerWithMetrics[]) || [];

    return (
        <CustomersTable initialCustomers={customers} />
    );
}
