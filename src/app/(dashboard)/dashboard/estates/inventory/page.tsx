import { EstateService } from "@/lib/services/EstateService";
import { InventoryClient } from "./inventory-client";

export const metadata = {
    title: "Bulk Inventory Management | Acrely",
};

export default async function InventoryBulkManagementPage() {
    const estateService = new EstateService();
    const estates = await estateService.getEstates();

    return (
        <InventoryClient initialEstates={JSON.parse(JSON.stringify(estates))} />
    );
}
