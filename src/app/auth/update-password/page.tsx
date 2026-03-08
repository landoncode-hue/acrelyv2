"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function UpdatePasswordForm() {
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
            setError('Invalid or missing reset link. Please request a new one.');
        }
    }, [token]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
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
            toast.success('Password updated successfully');
        } catch (error: any) {
            toast.error(error.message || "Failed to update password");
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
                            <Link href="/forgot-password">Request New Link</Link>
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
                        {success ? <CheckCircle2 className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {success ? 'Password Updated!' : 'Reset Your Password'}
                    </CardTitle>
                    <CardDescription>
                        {success
                            ? 'You can now log in with your new password.'
                            : 'Enter a strong new password for your account.'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!success ? (
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
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
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <Button className="w-full" asChild>
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <UpdatePasswordForm />
        </Suspense>
    );
}
