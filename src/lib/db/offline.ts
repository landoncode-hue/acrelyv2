
import Dexie, { Table } from 'dexie';

export interface OfflineEstate {
    id: string;
    name: string;
    location: string;
    updated_at: string;
}

export interface OfflinePlot {
    id: string;
    estate_id: string;
    plot_number: string;
    status: string;
    updated_at: string;
}

export interface OfflineCustomer {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    updated_at: string;
}

export interface OfflineAllocation {
    id: string;
    customer_id: string;
    plot_id: string;
    status: string;
    updated_at: string;
}

export class AcrelyOfflineDB extends Dexie {
    estates!: Table<OfflineEstate>;
    plots!: Table<OfflinePlot>;
    customers!: Table<OfflineCustomer>;
    allocations!: Table<OfflineAllocation>;

    constructor() {
        super('AcrelyOfflineDB');
        this.version(1).stores({
            estates: 'id, name, location',
            plots: 'id, estate_id, plot_number, status',
            customers: 'id, full_name, email',
            allocations: 'id, customer_id, plot_id, status'
        });
    }
}

export const db = new AcrelyOfflineDB();
