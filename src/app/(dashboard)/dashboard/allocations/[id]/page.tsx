import { AllocationDetailClient } from "./allocation-detail-client";
import { notFound } from "next/navigation";
import { AllocationService } from "@/lib/services/AllocationService";

const allocationService = new AllocationService();

export default async function AllocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const allocation = await allocationService.getById(id);

    if (!allocation) {
        return notFound();
    }

    let availablePlots: any[] = [];
    if (allocation.estate_id) {
        availablePlots = await allocationService.getAvailablePlots(allocation.estate_id);
    }

    return (
        <AllocationDetailClient
            allocation={allocation}
            initialAvailablePlots={availablePlots}
        />
    );
}
