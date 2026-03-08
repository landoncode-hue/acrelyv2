import { CustomerService } from "@/lib/services/CustomerService";
import PortalSettingsClient from "./portal-settings-client";
import { getCurrentUser } from "@/lib/auth/session";

const customerService = new CustomerService();

export default async function PortalSettingsPage() {
    const user = await getCurrentUser();

    if (!user) return <div>Unauthorized</div>;

    const customer = await customerService.getCustomerByProfileId(user.id);

    return <PortalSettingsClient customer={customer} />;
}
