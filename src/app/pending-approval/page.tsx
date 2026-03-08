"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
    const router = useRouter();


    const handleLogout = async () => {
        router.push("/login");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <CardTitle>Account Pending Approval</CardTitle>
                    <CardDescription>
                        Your agent application is currently under review by our team.
                        You will be notified once your account is approved.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
                </CardContent>
            </Card>
        </div>
    );
}
