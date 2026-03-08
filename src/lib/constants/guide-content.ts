import {
    Briefcase,
    Home,
    FileText,
    Banknote,
    UserCheck,
    Shield,
    BarChart,
    MessageSquare,
    BookOpen
} from "lucide-react";

export interface GuideStep {
    title: string;
    description: string;
    videoUrl?: string;
}

export interface GuideSection {
    id: string;
    title: string;
    description: string;
    icon: any;
    roles: string[];
    steps: GuideStep[];
    videoUrl?: string;
}

export const GUIDE_CONTENT: GuideSection[] = [
    {
        id: "leads",
        title: "Growth & Sales (Leads)",
        description: "How to manage potential customers and prospects.",
        icon: Briefcase,
        roles: ["sysadmin", "ceo", "md", "frontdesk", "agent"],
        videoUrl: "/videos/guide/leads-overview.webm",
        steps: [
            {
                title: "Lead Capture",
                description: "Navigate to the 'Leads' page and click 'New Lead'. Enter the prospect's contact details and interest level."
            },
            {
                title: "In-App Lead Assignment",
                description: "SysAdmins or CEOs can assign leads to specific agents via the 'Assign' button on the lead detail drawer."
            },
            {
                title: "Conversion",
                description: "Once a lead is ready to buy, click 'Convert to Customer'. This will move their data to the core customer registry."
            }
        ]
    },
    {
        id: "inventory",
        title: "Real Estate Inventory",
        description: "Managing estates and plot availability.",
        icon: Home,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        videoUrl: "/videos/guide/inventory-overview.webm",
        steps: [
            {
                title: "Estate Creation",
                description: "Got to 'Estates' -> 'Add Estate'. Define the location, basic pricing, and description."
            },
            {
                title: "Bulk Plot Generation",
                description: "Within an Estate view, use the 'Generate Plots' tool to create multiple numbered plots automatically."
            },
            {
                title: "Inventory Status",
                description: "Status colors: Green (Available), Yellow (Reserved/Pending), Red (Sold), Gray (Blocked)."
            }
        ]
    },
    {
        id: "allocations",
        title: "The 'Deal' Flow",
        description: "The process of allocating properties to customers.",
        icon: FileText,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        videoUrl: "/videos/guide/allocations-overview.webm",
        steps: [
            {
                title: "Drafting an Allocation",
                description: "Go to a customer profile, click 'Allocate Plot', select an available plot, and enter the agreed contract value."
            },
            {
                title: "Managerial Approval",
                description: "Pending allocations appear on the CEO/MD dashboard. They must be reviewed and 'Approved' before payments can be registered."
            },
            {
                title: "Letters of Allocation",
                description: "Once approved, a formal 'Allocation Letter' is automatically generated for the customer in their portal."
            }
        ]
    },
    {
        id: "payments",
        title: "Financial Operations",
        description: "Recording payments and generating receipts.",
        icon: Banknote,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        videoUrl: "/videos/guide/payments-overview.webm",
        steps: [
            {
                title: "Recording a Payment",
                description: "Go to 'Payments' -> 'Record Payment'. Upload proof of transfer and select the corresponding plot allocation."
            },
            {
                title: "Receipt Generation",
                description: "Verified payments will automatically generate a PDF Receipt. These are sent via email and stored in the customer portal."
            },
            {
                title: "Commissions",
                description: "Agents can view their earned commissions on their dedicated dashboard after a payment is verified."
            }
        ]
    },
    {
        id: "customer-portal",
        title: "Customer Self-Service",
        description: "What customers see in their Acrely portal.",
        icon: UserCheck,
        roles: ["customer", "sysadmin", "ceo", "md"],
        steps: [
            {
                title: "KYC Verification",
                description: "Customers must upload a valid ID and passport photo in the 'KYC Verification' tab to fully activate their account."
            },
            {
                title: "My Properties",
                description: "Customers can view their property list, download allocation letters, and see their payment progress bars."
            },
            {
                title: "Downloading Receipts",
                description: "Historical receipts are kept in the 'Payments' tab of the portal for lifetime access."
            }
        ]
    },
    {
        id: "admin",
        title: "Management & Safety",
        description: "System administration and maintenance.",
        icon: Shield,
        roles: ["sysadmin", "ceo", "md"],
        steps: [
            {
                title: "Staff Management",
                description: "Manage roles and access in 'Staff'. You can invite new staff or suspend inactive accounts safely."
            },
            {
                title: "Audit Logs",
                description: "The system records every login, payment entry, and approval in a tamper-proof audit log under Settings."
            },
            {
                title: "Backups",
                description: "Automated daily backups protect your dataset. Manual backups can be triggered in the 'Backups' module."
            }
        ]
    },
    {
        id: "reporting",
        title: "Analytics & Reports",
        description: "Understanding business performance.",
        icon: BarChart,
        roles: ["sysadmin", "ceo", "md", "frontdesk"],
        steps: [
            {
                title: "Executive Overview",
                description: "The main dashboard provides real-time charts on revenue, sales targets, and pending signatures."
            },
            {
                title: "Data Exports",
                description: "Use the 'Export' buttons on any table to download sales or payment data as CSV for external accounting."
            }
        ]
    }
];
