"use client";

import { useProfile } from "@/hooks/use-profile";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";
import { Loader2 } from "lucide-react";

export default function PortalPage() {
    const { profile, loading } = useProfile();

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!profile) {
        return <div>Access Denied. Please log in.</div>;
    }

    return (
        <div className="container py-8 max-w-7xl mx-auto">
            <CustomerDashboard profile={profile} />
        </div>
    );
}
