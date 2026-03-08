"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UserPlus, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function CompleteSignupForm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing invite link. Please ask your administrator to send a new one.');
        }
    }, [token]);

    const handleCompleteSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSuccess(true);
            toast.success('Account activated successfully');

            // Redirect to login after a short delay
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || "Failed to complete signup");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" asChild>
                            <Link href="/login">Go to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        {success ? <CheckCircle2 className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {success ? 'Setup Complete!' : 'Complete Your Setup'}
                    </CardTitle>
                    <CardDescription>
                        {success
                            ? 'Your account is active. Redirecting to login...'
                            : 'Welcome to Acrely! Please set your password to activate your account.'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!success ? (
                        <form onSubmit={handleCompleteSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Create Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Activating Account...
                                    </>
                                ) : (
                                    'Complete Setup'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <Button className="w-full" asChild>
                                <Link href="/login">Go to Login</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function CompleteSignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <CompleteSignupForm />
        </Suspense>
    );
}
