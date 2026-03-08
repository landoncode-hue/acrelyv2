


export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'converted' | 'lost';

export interface Lead {
    id: string;
    created_at: string;
    full_name: string;
    email?: string;
    phone: string;
    source: string;
    status: LeadStatus;
    assigned_to?: string;
    interest?: string;
    source_detail?: string;
    next_follow_up_at?: string;
    last_contacted_at?: string;
    converted_at?: string;
    lost_reason?: string;
    lost_at?: string;
    customer_id?: string;
    metadata?: any;
    // Joined data
    profiles?: {
        full_name: string;
    };
}

export interface Customer {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    phone: string;
    address?: string;
    status: 'active' | 'inactive';
    kyc_status: 'not_started' | 'pending' | 'verified' | 'rejected';
    kyc_data?: any;
    occupation?: string | null;
    next_of_kin_name?: string | null;
    next_of_kin_phone?: string | null;
    created_from_lead_id?: string | null;
    created_by: string;
    metadata?: any;
}

export interface CustomerWithMetrics extends Customer {
    estates: string;
    total_properties: number;
    total_paid: number;
    outstanding_balance: number;
    has_overdue: boolean;
}

export interface Estate {
    id: string;
    created_at: string;
    name: string;
    location: string;
    total_plots: number;
    available_plots: number;
    base_price: number;
    status: 'active' | 'sold_out' | 'coming_soon';
    metadata?: any;
}

export interface Plot {
    id: string;
    created_at: string;
    estate_id: string;
    plot_number: string;
    size_sqm: number;
    status: 'available' | 'reserved' | 'sold' | 'held';
    price_override?: number;
    dimensions?: string;
    metadata?: any;
}

export interface Allocation {
    id: string;
    created_at: string;
    customer_id: string;
    estate_id: string;
    plot_id: string;
    total_price: number;
    paid_amount: number; // For compatibility
    amount_paid: number;
    balance: number;
    outstanding_balance: number;
    net_price?: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled' | 'approved';
    payment_plan_id?: string;
    metadata?: any;
    customer?: Customer;
    estate?: Estate;
    plot?: Plot;
}

export interface AllocationWithDetails extends Allocation {
    customer: Customer;
    estate: Estate;
    plot: Plot;
}

export interface Payment {
    id: string;
    created_at: string;
    allocation_id: string;
    customer_id?: string;
    amount: number;
    payment_date?: string;
    transaction_ref?: string;
    payment_method: 'bank_transfer' | 'cash' | 'check' | 'other';
    reference_number?: string;
    status: 'pending' | 'verified' | 'failed' | 'cancelled';
    verified_at?: string;
    verified_by?: string;
    metadata?: any;
    allocations?: Allocation;
}

export interface PaymentWithDetails extends Payment {
    customer: Customer;
    allocation: Allocation & {
        estate: Estate;
        plot: Plot;
    };
}

export interface PaymentPlan {
    id: string;
    created_at: string;
    allocation_id: string;
    total_amount: number;
    deposit_amount: number;
    installment_amount: number;
    total_installments: number;
    frequency: 'monthly' | 'quarterly' | 'bi-annual';
    start_date: string;
    status: 'active' | 'completed' | 'cancelled';
    metadata?: any;
}

export interface PaymentPlanInstallment {
    id: string;
    created_at: string;
    payment_plan_id: string;
    amount_due: number;
    amount_paid: number;
    status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
    due_date: string;
    installment_number: number;
    paid_at?: string;
}

export interface Apartment {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    location: string;
    price: number;
    amenities: string[];
    media: {
        images: string[];
        videos: string[];
    };
    status: 'available' | 'sold' | 'reserved';
    metadata?: any;
}

export interface Appointment {
    id: string;
    created_at: string;
    updated_at: string;
    apartment_id: string;
    customer_id: string;
    appointment_date: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    notes?: string | null;
    metadata?: any;
    // Joined data
    apartments?: {
        name: string;
        location: string;
    };
    customers?: {
        full_name: string;
        phone: string;
    };
}

export type Installment = PaymentPlanInstallment;

export interface Profile {
    id: string;
    created_at: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    role: 'sysadmin' | 'ceo' | 'md' | 'frontdesk' | 'agent' | 'customer';
    is_staff: boolean;
    staff_status?: 'invited' | 'active' | 'suspended' | 'deactivated';
    employee_id?: string | null;
    avatar_url?: string | null;
    dicebear_seed?: string | null;
    metadata?: any;
}

export type StaffMember = Profile;

export interface Agent {
    id: string;
    profile_id: string;
    commission_rate: number;
    status: 'pending' | 'active' | 'suspended' | 'rejected';
    created_at: string;
    updated_at: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    profiles?: Profile;
}
