import { IRepository } from './IRepository';
import { Allocation, AllocationWithDetails } from "../types";

export interface IAllocationRepository extends IRepository<Allocation> {
    createAllocationWorkflow(params: any): Promise<string[]>; // Returns allocation IDs
    approveAllocation(allocationId: string, actorId: string): Promise<void>;
    assignPlot(allocationId: string, plotId: string, plotSize: string, actorId: string, assignSuffix?: string): Promise<void>;
    reassignPlot(allocationId: string, newPlotId: string, reason: string, actorId: string): Promise<void>;
    cancelAllocation(allocationId: string, actorId: string, reason?: string): Promise<void>;
    completeAllocation(id: string, actorId: string): Promise<void>;
    findByIdWithDetails(id: string): Promise<AllocationWithDetails | null>;
    findByCustomerId(customerId: string): Promise<Allocation[]>;
    findByStatus(status: string): Promise<Allocation[]>;
    updateFinancials(id: string, data: { amount_paid: number; outstanding_balance: number }): Promise<void>;
}
