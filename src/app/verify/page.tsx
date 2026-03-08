"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function VerifyForm() {
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const router = useRouter();

    const handleSendCode = async () => {
        setIsSending(true);
        try {
            const res = await fetch('/api/auth/send-verification', {
                method: 'POST',
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to send verification code");
                return;
            }

            setCodeSent(true);
            toast.success("Verification code sent to your email");
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSending(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please enter the verification code");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Verification failed");
                return;
            }

            toast.success("Email verified successfully");
            router.push(data.redirect || '/dashboard');
            router.refresh();
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
                        <img src="/logo.svg" alt="Acrely Logo" className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-2xl">Verify Email</CardTitle>
                    <CardDescription>
                        {codeSent
                            ? "Enter the 6-digit code sent to your email"
                            : "Click below to send a verification code to your email"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!codeSent ? (
                        <Button
                            type="button"
                            className="w-full"
                            onClick={handleSendCode}
                            disabled={isSending}
                        >
                            {isSending ? "Sending Code..." : "Send Verification Code"}
                        </Button>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="token">OTP Code</Label>
                                <Input
                                    id="token"
                                    type="text"
                                    placeholder="123456"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full mt-2"
                                onClick={handleSendCode}
                                disabled={isSending}
                            >
                                {isSending ? "Resending..." : "Resend Code"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyForm />
        </Suspense>
    )
}
