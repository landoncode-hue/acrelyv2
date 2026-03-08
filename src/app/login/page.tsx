"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const loginSchema = z.object({
    identifier: z.string().min(1, "Email or phone number is required"),
    password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
    const [countdown, setCountdown] = useState<string>("");
    const [loginError, setLoginError] = useState<string | null>(null);
    const router = useRouter();


    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    });

    // Countdown timer for lockout
    useEffect(() => {
        if (!lockoutTime) {
            setCountdown("");
            return;
        }

        const interval = setInterval(() => {
            const now = new Date();
            const diff = lockoutTime.getTime() - now.getTime();

            if (diff <= 0) {
                setIsLocked(false);
                setLockoutTime(null);
                setCountdown("");
                clearInterval(interval);
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [lockoutTime]);

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        if (isLocked) {
            toast.error("Account temporarily locked", {
                description: `Please try again in ${countdown}`,
            });
            return;
        }

        setIsLoading(true);
        setLoginError(null);
        try {
            let email = data.identifier;

            // Detect if identifier is a phone number
            const isPhone = /^[+]?[\d]{7,15}$/.test(data.identifier.replace(/\s/g, '')) ||
                (data.identifier.startsWith('0') && data.identifier.length >= 10);

            if (isPhone) {
                // Normalize phone
                let digits = data.identifier.replace(/\D/g, '');
                if (digits.startsWith('0')) digits = '234' + digits.slice(1);
                if (!digits.startsWith('234') && digits.length === 10) digits = '234' + digits;

                // Convert to internal email format for customers
                email = `${digits}@portal.acrely.ng`;
            }

            // Call real login API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: data.password }),
            });

            const result = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    // Rate limited
                    setIsLocked(true);
                    toast.error("Too many failed attempts", {
                        description: result.error,
                    });
                    return;
                }
                setLoginError(result.error || "Invalid email or password");
                toast.error("Login failed", {
                    description: result.error || "Invalid email or password",
                    id: "login-error", // Added for testing
                });
                return;
            }

            const role = result.user?.role || 'customer';
            const redirectPath = (result.user?.is_staff || role === 'agent') ? '/dashboard' : '/portal';

            toast.success("Welcome back", {
                description: `Redirecting you to your ${role === 'customer' ? 'portal' : 'dashboard'}...`,
            });

            window.location.href = redirectPath;
        } catch (error) {
            logger.error('Unexpected error during login:', error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 transition-colors">
            <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-primary/5">
                        <Image
                            src="/logo.svg"
                            alt="Acrely Logo"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                        />
                    </div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground text-balance font-sans">
                        Enter your credentials to access the Acrely platform.
                    </p>
                </div>

                {/* Lockout Warning */}
                {isLocked && lockoutTime && (
                    <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                            <div>
                                <p className="font-semibold text-destructive text-sm">
                                    Account temporarily locked
                                </p>
                                <p className="text-sm text-destructive/80 mt-1">
                                    Too many failed attempts. Please try again in <strong>{countdown}</strong> or reset your password.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* API Error Alert */}
                {loginError && (
                    <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4" data-testid="login-error">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                            <p className="font-medium text-destructive text-sm">
                                {loginError}
                            </p>
                        </div>
                    </div>
                )}

                {/* Login Form Card */}
                <div className="glass-card overflow-hidden rounded-xl p-8 border bg-card/50 shadow-sm backdrop-blur-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="identifier" className="font-medium">Email or Phone Number</Label>
                            <Input
                                id="identifier"
                                type="text"
                                placeholder="Email or 08012345678"
                                autoComplete="username"
                                className="h-11 bg-background/50 transition-all focus:bg-background font-sans"
                                disabled={isLocked}
                                data-testid="email-input"
                                {...register("identifier")}
                            />
                            {errors.identifier && (
                                <p className="text-xs font-medium text-destructive animate-in slide-in-from-left-1">
                                    {errors.identifier.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Button
                                    variant="link"
                                    className="px-0 font-normal h-auto text-xs text-muted-foreground hover:text-primary"
                                    type="button"
                                    onClick={() => router.push('/forgot-password')}
                                    data-testid="forgot-password-link"
                                >
                                    Forgot password?
                                </Button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="h-11 bg-background/50 transition-all focus:bg-background font-sans pr-10"
                                    disabled={isLocked}
                                    data-testid="password-input"
                                    {...register("password")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive animate-in slide-in-from-left-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium font-heading shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            disabled={isLoading || isLocked}
                            data-testid="login-submit"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : isLocked ? (
                                `Locked (${countdown})`
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </div>

                {/* Refined Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/60 font-medium font-sans">
                        Powered by <span className="text-black font-bold font-heading">Acrely</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
