"use client";

import { useState } from "react";

import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";
import { updateOnboardingProfileAction, completeOnboardingAction } from "@/lib/actions/onboarding-actions";

export default function OnboardingPage() {
    const { profile } = useProfile();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        phone: "",
        address: "",
        marketing_consent: true
    });

    const handleUpdateProfile = async () => {
        if (!formData.phone) return toast.error("Phone number is required");
        setLoading(true);

        try {
            const result = await updateOnboardingProfileAction({
                phone: formData.phone,
                address: formData.address
            });

            if (result?.success) {
                setStep(2);
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to update profile";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            const result = await completeOnboardingAction();

            if (result?.success) {
                toast.success("Welcome to Acrely!");
                // router.refresh(); // Server action revalidates
                router.push("/dashboard");
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Error completing onboarding";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Error completing onboarding");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg border-zinc-200 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome to Acrely</CardTitle>
                    <CardDescription>Let's get you set up in just a few steps.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Stepper */}
                    <div className="flex justify-center gap-4 mb-8">
                        <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
                        <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-semibold text-lg text-center mb-4">Complete your Profile</h3>
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={profile?.full_name || ""} disabled className="bg-zinc-100" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+234..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Your residential address"
                                />
                            </div>
                            <Button className="w-full mt-4" onClick={handleUpdateProfile} disabled={loading}>
                                {loading ? "Saving..." : "Continue"}
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
                            <div className="flex justify-center">
                                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">You're all set!</h3>
                                <p className="text-zinc-500 mt-2">
                                    Your account is ready. You can now browse estates, view your allocations, and make payments.
                                </p>
                            </div>
                            <Button className="w-full" onClick={handleComplete} disabled={loading}>
                                {loading ? "Finalizing..." : "Go to Dashboard"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
