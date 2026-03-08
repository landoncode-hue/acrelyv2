import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="mb-4 rounded-full bg-red-100 p-6">
                <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
            <p className="mt-2 text-muted-foreground max-w-md">
                You do not have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.
            </p>
            <div className="mt-8">
                <Button asChild>
                    <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
