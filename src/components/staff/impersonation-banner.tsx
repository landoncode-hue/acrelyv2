"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface ImpersonationSession {
    target: {
        id: string;
        email: string;
        full_name: string;
        role: string;
    };
    admin: {
        id: string;
        email: string;
        full_name: string;
    };
}

export function ImpersonationBanner() {
    const [session, setSession] = useState<ImpersonationSession | null>(null);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        // Check if there's an active impersonation session
        const impersonationData = sessionStorage.getItem('impersonation_session');
        if (impersonationData) {
            try {
                setSession(JSON.parse(impersonationData));
            } catch (e) {
                console.error('Failed to parse impersonation session', e);
            }
        }
    }, []);

    const handleExitImpersonation = async () => {
        setExiting(true);
        try {
            const response = await fetch('/api/admin/impersonate', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to exit impersonation');
            }

            // Clear impersonation session
            sessionStorage.removeItem('impersonation_session');

            // Restore admin session (stored separately)
            const adminSession = sessionStorage.getItem('admin_session_backup');
            if (adminSession) {
                // Restore admin session tokens
                sessionStorage.removeItem('admin_session_backup');
            }

            toast.success('Exited impersonation mode');

            // Reload to restore admin session
            window.location.href = '/dashboard/staff';
        } catch (error: any) {
            toast.error(error.message || 'Failed to exit impersonation');
        } finally {
            setExiting(false);
        }
    };

    if (!session) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 animate-pulse" />
                        <div>
                            <p className="font-semibold">
                                Impersonation Mode Active
                            </p>
                            <p className="text-sm opacity-90">
                                You are viewing as <strong>{session.target.full_name}</strong> ({session.target.role})
                                {' • '}
                                Admin: {session.admin.full_name}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleExitImpersonation}
                        disabled={exiting}
                        className="bg-white text-red-600 hover:bg-gray-100"
                    >
                        {exiting ? (
                            "Exiting..."
                        ) : (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Exit Impersonation
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
