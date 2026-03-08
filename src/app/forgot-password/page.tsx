"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Phone, Mail, Shield, Lock, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";


type Method = 'email' | 'phone';
type Step = 'input' | 'otp' | 'password' | 'success';

export default function ForgotPasswordPage() {
    const [method, setMethod] = useState<Method>('phone');
    const [step, setStep] = useState<Step>('input');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const formatPhone = (num: string) => {
        let digits = num.replace(/\D/g, '');
        if (digits.startsWith('0')) digits = '234' + digits.slice(1);
        if (!digits.startsWith('234') && digits.length === 10) digits = '234' + digits;
        return '+' + digits;
    };

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (method === 'email') {
                const res = await fetch('/api/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setStep('success');
                toast.success("Password reset link sent to your email");
            } else {
                const res = await fetch('/api/auth/forgot-password/phone', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: formatPhone(phone) })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setStep('otp');
                toast.success("Reset code sent to your phone");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to initiate password reset");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('password');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password/phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formatPhone(phone),
                    otp,
                    password
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setStep('success');
            toast.success("Password reset successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        {step === 'input' && <Lock className="h-6 w-6" />}
                        {step === 'otp' && <Shield className="h-6 w-6" />}
                        {step === 'password' && <Lock className="h-6 w-6" />}
                        {step === 'success' && <CheckCircle2 className="h-6 w-6" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {step === 'input' && 'Forgot Password?'}
                        {step === 'otp' && 'Verify Your Phone'}
                        {step === 'password' && 'New Password'}
                        {step === 'success' && 'Ready to go!'}
                    </CardTitle>
                    <CardDescription>
                        {step === 'input' && 'Choose your recovery method below'}
                        {step === 'otp' && `Enter the code sent to ${phone}`}
                        {step === 'password' && 'Enter your new password below'}
                        {step === 'success' && method === 'email'
                            ? "We've sent a recovery link to your email."
                            : "Your password has been updated."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 'input' && (
                        <div className="space-y-6">
                            <div className="flex p-1 bg-muted rounded-lg">
                                <Button
                                    className={`flex-1 ${method === 'phone' ? 'bg-white shadow-sm' : 'bg-transparent text-muted-foreground hover:bg-white/50'}`}
                                    variant="ghost"
                                    onClick={() => setMethod('phone')}
                                >
                                    <Phone className="h-4 w-4 mr-2" /> Phone
                                </Button>
                                <Button
                                    className={`flex-1 ${method === 'email' ? 'bg-white shadow-sm' : 'bg-transparent text-muted-foreground hover:bg-white/50'}`}
                                    variant="ghost"
                                    onClick={() => setMethod('email')}
                                >
                                    <Mail className="h-4 w-4 mr-2" /> Email
                                </Button>
                            </div>

                            <form onSubmit={handleInitialSubmit} className="space-y-4">
                                {method === 'email' ? (
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            type="tel"
                                            placeholder="08012345678"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Send Reset Link
                                </Button>
                            </form>
                        </div>
                    )}

                    {step === 'otp' && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <Button type="submit" className="w-full" disabled={otp.length !== 6}>
                                Continue
                            </Button>
                        </form>
                    )}

                    {step === 'password' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Update Password
                            </Button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 mt-0.5" />
                                <p>
                                    {method === 'email'
                                        ? "Please check your inbox (and spam folder) for a link to reset your password."
                                        : "Your password has been reset successfully. You can now log in with your new credentials."}
                                </p>
                            </div>
                            <Button className="w-full" asChild>
                                <Link href="/login">Back to Login</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-center border-t py-4">
                    <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
