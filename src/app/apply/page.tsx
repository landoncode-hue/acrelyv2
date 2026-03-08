"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, ChevronRight, ChevronLeft, User, Briefcase, CheckSquare, Loader2, Eye, EyeOff } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { submitAgentApplicationAction } from "@/app/actions/apply-actions";

export default function AgentApplicationPage() {
    const [step, setStep] = useState(1);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        experience: "",
        address: "",
        bio: ""
    });
    const [passportFile, setPassportFile] = useState<File | null>(null);

    const handleNext = () => {
        if (step === 1) {
            if (!formData.full_name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
                toast.error("Please fill in all required fields");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            if (formData.password.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            if (!passportFile) {
                toast.error("Please upload a passport photograph");
                setIsLoading(false);
                return;
            }

            const formDataToSubmit = new FormData();
            formDataToSubmit.append('full_name', formData.full_name);
            formDataToSubmit.append('email', formData.email);
            formDataToSubmit.append('phone', formData.phone);
            formDataToSubmit.append('password', formData.password);
            formDataToSubmit.append('experience', formData.experience);
            formDataToSubmit.append('address', formData.address);
            formDataToSubmit.append('bio', formData.bio);
            formDataToSubmit.append('passport', passportFile);

            const result = await submitAgentApplicationAction(formDataToSubmit);

            if (result.success) {
                setSuccess(true);
                toast.success("Application submitted successfully!");
            } else {
                toast.error(result.error || "Failed to submit application");
            }
        } catch (error: any) {
            console.error("Application error:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 transition-colors">
                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-4 ring-green-100">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                            Application Received!
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground text-balance font-sans">
                            Your application has been submitted and is pending review. We'll contact you shortly.
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="glass-card overflow-hidden rounded-xl p-6 border bg-card/50 shadow-sm backdrop-blur-xl">
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-2">What happens next?</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>Our team will review your application</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>You'll receive an email confirmation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>Once approved, you can start earning</span>
                                    </li>
                                </ul>
                            </div>
                            <Button
                                className="w-full h-11 text-base font-medium font-heading shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                                onClick={() => router.push('/login')}
                            >
                                Go to Login
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground/60 font-medium font-sans">
                            Powered by <span className="text-black font-bold font-heading">Acrely</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 transition-colors">
            <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl ring-4 ring-primary/5">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="h-8 w-8"
                        />
                    </div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                        Become an Agent
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground text-balance font-sans">
                        Join Pinnacle Builders and earn commissions on property sales.
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center items-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step > s
                                    ? 'bg-primary text-white'
                                    : step === s
                                        ? 'bg-primary text-white ring-4 ring-primary/20'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-10 h-0.5 mx-1 ${step > s ? 'bg-primary' : 'bg-border'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="glass-card overflow-hidden rounded-xl p-8 border bg-card/50 shadow-sm backdrop-blur-xl">
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
                                <User className="h-4 w-4" /> Account Information
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fullname" className="font-medium">Full Name</Label>
                                <Input
                                    id="fullname"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="h-11 bg-background/50 transition-all focus:bg-background font-sans"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-medium">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="h-11 bg-background/50 transition-all focus:bg-background font-sans"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="font-medium">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="08012345678"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-11 bg-background/50 transition-all focus:bg-background font-sans"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="font-medium">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min. 8 chars"
                                            className="h-11 bg-background/50 transition-all focus:bg-background font-sans pr-10"
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
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="font-medium">Confirm</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Re-enter"
                                        className="h-11 bg-background/50 transition-all focus:bg-background font-sans"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
                                <Briefcase className="h-4 w-4" /> Professional Profile
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience" className="font-medium">Years of Experience</Label>
                                <Select
                                    value={formData.experience}
                                    onValueChange={(value) => setFormData({ ...formData, experience: value })}
                                >
                                    <SelectTrigger className="h-11 bg-background/50 transition-all focus:bg-background font-sans">
                                        <SelectValue placeholder="Select experience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">No experience (New to real estate)</SelectItem>
                                        <SelectItem value="1">Less than 1 year</SelectItem>
                                        <SelectItem value="2">1-2 years</SelectItem>
                                        <SelectItem value="3">3-5 years</SelectItem>
                                        <SelectItem value="5">5-10 years</SelectItem>
                                        <SelectItem value="10">10+ years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="font-medium">Your Location</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="City, State"
                                    className="h-11 bg-background/50 transition-all focus:bg-background font-sans"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="font-medium">About You (Optional)</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about your experience..."
                                    className="resize-none h-24 bg-background/50 transition-all focus:bg-background font-sans"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passport" className="font-medium">Passport Photograph</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        id="passport"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setPassportFile(e.target.files?.[0] || null)}
                                    />
                                    {passportFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                                                <img src={URL.createObjectURL(passportFile)} className="h-full w-full object-cover" alt="Preview" />
                                            </div>
                                            <p className="text-sm font-medium text-primary">{passportFile.name}</p>
                                            <p className="text-xs text-muted-foreground">Click to change</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <p className="text-sm font-medium">Upload Passport Photo</p>
                                            <p className="text-xs text-muted-foreground mt-1">Required for ID generation</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
                                <CheckSquare className="h-4 w-4" /> Review Application
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm border">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium text-foreground">{formData.full_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium text-foreground">{formData.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone</span>
                                    <span className="font-medium text-foreground">{formData.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Experience</span>
                                    <span className="font-medium text-foreground">{formData.experience || '0'} years</span>
                                </div>
                                {formData.address && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Location</span>
                                        <span className="font-medium text-foreground">{formData.address}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Passport</span>
                                    <span className="font-medium text-foreground">{passportFile ? passportFile.name : "Not uploaded"}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg border">
                                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                                <p>By submitting, you agree to our Terms of Service. Your application will be reviewed within 24-48 hours.</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-6 pt-6 border-t">
                        {step > 1 ? (
                            <Button variant="outline" onClick={handleBack} className="h-11">
                                <ChevronLeft className="mr-1 h-4 w-4" /> Back
                            </Button>
                        ) : (
                            <Button
                                variant="link"
                                onClick={() => router.push('/login')}
                                className="h-11 px-0 text-muted-foreground hover:text-primary"
                            >
                                Already have an account?
                            </Button>
                        )}

                        {step < 3 ? (
                            <Button
                                onClick={handleNext}
                                className="h-11 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="h-11 min-w-[140px] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/60 font-medium font-sans">
                        Powered by <span className="text-black font-bold font-heading">Acrely</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
