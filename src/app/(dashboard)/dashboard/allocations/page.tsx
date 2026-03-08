import { AllocationService } from "@/lib/services/AllocationService";
import AllocationsClient from "./allocations-client";

const allocationService = new AllocationService();

export default async function AllocationsPage() {
    const allocations = await allocationService.getAllWithDetails();

    return (
        <AllocationsClient initialAllocations={allocations} />
    );
}
