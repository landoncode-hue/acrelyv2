"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Construction, Loader2 } from "lucide-react";

export default function MaintenancePage() {
    const [message, setMessage] = useState("We are currently performing scheduled upgrades. The system will be back online shortly. Thank you for your patience.");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Maintenance status fetching disabled
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="mb-4 rounded-full bg-yellow-100 p-6">
                <Construction className="h-10 w-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">System Maintenance</h1>

            {loading ? (
                <div className="mt-4 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <p className="mt-2 text-muted-foreground max-w-md whitespace-pre-wrap">
                    {message}
                </p>
            )}

            <div className="mt-8">
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    disabled={loading}
                >
                    Try Again
                </Button>
            </div>
        </div>
    );
}
