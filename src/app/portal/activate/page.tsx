"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Phone, Shield, Lock, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = 'phone' | 'otp' | 'password' | 'success';

export default function ActivatePortalPage() {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string>('');
    const router = useRouter();

    // Format phone number for display
    const formatPhone = (num: string) => {
        // Remove non-digits
        let digits = num.replace(/\D/g, '');
        // Handle Nigerian numbers
        if (digits.startsWith('0')) {
            digits = '234' + digits.slice(1);
        }
        if (!digits.startsWith('234')) {
            digits = '234' + digits;
        }
        return '+' + digits;
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim()) {
            toast.error("Please enter your phone number");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/customers/verify-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formatPhone(phone) })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            if (data.alreadyActivated) {
                toast.info("Your account is already active. Please log in.");
                router.push('/login');
                return;
            }

            setCustomerId(data.customerId);
            setCustomerName(data.customerName);
            setStep('otp');
            toast.success("Verification code sent to your phone");

        } catch (error: any) {
            toast.error(error.message || "Failed to verify phone number");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/customers/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formatPhone(phone),
                    otp,
                    customerId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setStep('password');

        } catch (error: any) {
            toast.error(error.message || "Invalid verification code");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
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
            const res = await fetch('/api/customers/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formatPhone(phone),
                    password,
                    customerId
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setStep('success');

        } catch (error: any) {
            toast.error(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/customers/verify-phone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formatPhone(phone), resend: true })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }

            toast.success("New code sent to your phone");

        } catch (error: any) {
            toast.error(error.message || "Failed to resend code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl flex items-center justify-center mb-4">
                        {step === 'phone' && <Phone className="h-6 w-6 text-white" />}
                        {step === 'otp' && <Shield className="h-6 w-6 text-white" />}
                        {step === 'password' && <Lock className="h-6 w-6 text-white" />}
                        {step === 'success' && <CheckCircle2 className="h-6 w-6 text-white" />}
                    </div>
                    <CardTitle className="text-2xl">
                        {step === 'phone' && 'Activate Your Portal'}
                        {step === 'otp' && 'Verify Your Phone'}
                        {step === 'password' && 'Create Password'}
                        {step === 'success' && 'Account Activated!'}
                    </CardTitle>
                    <CardDescription>
                        {step === 'phone' && 'Enter the phone number used during your registration'}
                        {step === 'otp' && `Enter the 6-digit code sent to ${formatPhone(phone)}`}
                        {step === 'password' && `Welcome ${customerName}! Create a secure password`}
                        {step === 'success' && 'Your portal account is now ready'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 'phone' && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="08012345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="text-lg"
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use the same phone number from your property registration
                                </p>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Continue'
                                )}
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="text-brand-purple hover:underline">
                                    Log in
                                </Link>
                            </div>
                        </form>
                    )}

                    {step === 'otp' && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={setOtp}
                                        disabled={loading}
                                    >
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
                                <p className="text-center text-sm text-muted-foreground">
                                    Didn't receive a code?{' '}
                                    <button
                                        type="button"
                                        className="text-brand-purple hover:underline"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                    >
                                        Resend
                                    </button>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep('phone')}
                                    disabled={loading}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <Button type="submit" className="flex-1" disabled={loading || otp.length !== 6}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Password must be at least 8 characters long
                            </p>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-muted-foreground">
                                    Your portal account has been created successfully. You can now log in to view your properties, payments, and documents.
                                </p>
                            </div>
                            <Button onClick={() => router.push('/login')} className="w-full">
                                Go to Login
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
