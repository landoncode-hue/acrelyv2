import { AllocationService } from "@/lib/services/AllocationService";
import PendingClient from "./pending-client";

const allocationService = new AllocationService();

export default async function PendingApprovalsPage() {
    const allocations = await allocationService.getPendingApprovals();

    return (
        <PendingClient initialAllocations={allocations} />
    );
}
