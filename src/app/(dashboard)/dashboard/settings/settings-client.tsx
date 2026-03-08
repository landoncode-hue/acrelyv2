"use client";

import { useEffect, useState } from "react";
import { updatePasswordAction, uploadLogoAction, uploadAvatarAction } from "@/app/actions/settings";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Settings as SettingsIcon, Shield, Palette, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { updateProfileAction } from "@/app/actions/profile";
import { updateAgentDetailsAction, updateAvatarAction, updateSystemSettingsAction } from "@/lib/actions/settings-actions";
import { PageHeader } from "@/components/layout/page-header";

interface SettingsClientProps {
    initialProfile: any;
    initialAgentDetails: any;
    initialSystemSettings: any;
    initialLogoUrl: string | null;
}

export default function SettingsClient({
    initialProfile,
    initialAgentDetails,
    initialSystemSettings,
    initialLogoUrl
}: SettingsClientProps) {
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileForm, setProfileForm] = useState({
        full_name: initialProfile?.full_name || "",
        phone: initialProfile?.phone || ""
    });

    // Password State
    const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });

    // System Settings State (Admin only)
    const [systemSettings, setSystemSettings] = useState<any>({
        company_name: initialSystemSettings?.company_name || "Acrely Real Estate",
        sms_threshold: initialSystemSettings?.sms_threshold || 500,
        maintenance_mode: initialSystemSettings?.maintenance_mode || { enabled: false, message: "" }
    });

    // Branding State
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile?.avatar_url || null);
    const [uploading, setUploading] = useState(false);

    // Agent State
    const [agentForm, setAgentForm] = useState({
        bank_name: initialAgentDetails?.bank_name || "",
        account_number: initialAgentDetails?.account_number || "",
        account_name: initialAgentDetails?.account_name || ""
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadLogoAction(formData);
            if (!result.success) throw new Error("Upload failed");

            setLogoUrl(`${result.url}?t=${Date.now()}`);
            toast.success("Logo uploaded successfully");
        } catch (error: any) {
            logger.error("Upload error:", error);
            toast.error(error.message || "Failed to upload logo");
        } finally {
            setUploading(false);
        }
    };

    const updateAgentDetails = async () => {
        setLoading(true);
        try {
            const result = await updateAgentDetailsAction({
                bank_name: agentForm.bank_name,
                account_number: agentForm.account_number,
                account_name: agentForm.account_name
            });

            if (result?.success) {
                toast.success("Banking details updated");
            } else {
                throw new Error(typeof result?.error === 'string' ? result.error : result?.error?.message || "Failed update");
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to update banking details");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !initialProfile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("userId", initialProfile.id);

            const uploadResult = await uploadAvatarAction(formData);
            if (!uploadResult.success) throw new Error("Failed to upload to storage");

            const publicUrl = `${uploadResult.url}?t=${Date.now()}`;

            const result = await updateAvatarAction({ avatar_url: publicUrl });
            if (!result?.success) throw new Error("Failed to update profile");

            setAvatarUrl(publicUrl);
            toast.success("Profile photo uploaded");
        } catch (error: any) {
            logger.error("Upload error:", error);
            toast.error(error.message || "Failed to upload photo");
        } finally {
            setUploading(false);
        }
    };

    const updateProfile = async () => {
        setLoading(true);
        try {
            await updateProfileAction(profileForm.full_name);
            toast.success("Profile updated");
        } catch (e: any) {
            toast.error(e.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        if (passwordForm.password !== passwordForm.confirm) {
            return toast.error("Passwords do not match");
        }
        setLoading(true);
        try {
            await updatePasswordAction(passwordForm.password);
            toast.success("Password updated successfully");
            setPasswordForm({ password: "", confirm: "" });
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const saveSystemSettings = async () => {
        setLoading(true);
        try {
            const updates = [
                { key: 'company_name', value: systemSettings.company_name },
                { key: 'sms_threshold', value: systemSettings.sms_threshold },
                { key: 'maintenance_mode', value: systemSettings.maintenance_mode }
            ];

            const result = await updateSystemSettingsAction({ updates });
            if (result?.success) {
                toast.success("System configuration saved");
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = ['sysadmin', 'ceo', 'md'].includes(initialProfile?.role || "");

    return (
        <div className="space-y-6 max-w-4xl">
            <PageHeader
                title="Settings"
                description="Manage your account settings and preferences"
            />

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">
                        <User className="h-4 w-4 mr-2" /> My Profile
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="h-4 w-4 mr-2" /> Security
                    </TabsTrigger>
                    {isAdmin && (
                        <>
                            <TabsTrigger value="branding">
                                <Palette className="h-4 w-4 mr-2" /> Branding
                            </TabsTrigger>
                            <TabsTrigger value="system">
                                <SettingsIcon className="h-4 w-4 mr-2" /> System
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={profileForm.full_name}
                                    onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Profile Photo / Passport</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-full bg-muted overflow-hidden border">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-8 w-8 m-auto text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="avatar-upload" className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                            Upload Photo
                                        </Label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={uploading}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Upload a clear passport photograph or headshot.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={initialProfile?.email} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span className="capitalize font-medium">{initialProfile?.role}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={updateProfile} disabled={loading}>Save Profile</Button>
                        </CardFooter>
                    </Card>

                    {initialProfile?.role === 'agent' && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Banking Details</CardTitle>
                                <CardDescription>Enter the account where you want to receive commissions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input
                                        placeholder="e.g. GTBank"
                                        value={agentForm.bank_name}
                                        onChange={e => setAgentForm({ ...agentForm, bank_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Account Number</Label>
                                        <Input
                                            placeholder="0123456789"
                                            value={agentForm.account_number}
                                            onChange={e => setAgentForm({ ...agentForm, account_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Name</Label>
                                        <Input
                                            placeholder="Account Name"
                                            value={agentForm.account_name}
                                            onChange={e => setAgentForm({ ...agentForm, account_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={updateAgentDetails} disabled={loading}>Save Banking Details</Button>
                            </CardFooter>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={passwordForm.password}
                                    onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={updatePassword} disabled={loading} variant="destructive">Update Password</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="branding">
                        <Card>
                            <CardHeader>
                                <CardTitle>Branding & Identity</CardTitle>
                                <CardDescription>Customize how your brand looks on receipts and reports.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Label>Company Logo</Label>
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 bg-muted/30 hover:bg-muted/50 transition-colors relative cursor-pointer group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            accept="image/png, image/jpeg, image/svg+xml"
                                            onChange={handleLogoUpload}
                                            disabled={uploading}
                                        />

                                        {logoUrl ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="relative h-32 w-32 rounded-lg bg-white border shadow-sm flex items-center justify-center p-2 overflow-hidden">
                                                    <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Upload className="h-4 w-4" /> Click or drag to replace logo
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                                                    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-medium">Upload Company Logo</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Recommended size: 512x512px (PNG, SVG)</p>
                                                </div>
                                            </div>
                                        )}

                                        {uploading && (
                                            <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-20 rounded-xl animate-in fade-in">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This logo will be used at the top of all official payment receipts and automated messages.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {isAdmin && (
                    <TabsContent value="system">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Configuration</CardTitle>
                                    <CardDescription>Manage global settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Company Name</Label>
                                        <Input
                                            value={systemSettings.company_name}
                                            onChange={e => setSystemSettings({ ...systemSettings, company_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SMS Low Balance Threshold</Label>
                                        <Input
                                            type="number"
                                            value={systemSettings.sms_threshold}
                                            onChange={e => setSystemSettings({ ...systemSettings, sms_threshold: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className="pt-4 border-t space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-base">Maintenance Mode</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable to prevent non-admin users from accessing the system.
                                                </p>
                                            </div>
                                            <Switch
                                                checked={systemSettings.maintenance_mode?.enabled}
                                                onCheckedChange={checked => setSystemSettings({
                                                    ...systemSettings,
                                                    maintenance_mode: { ...systemSettings.maintenance_mode, enabled: checked }
                                                })}
                                            />
                                        </div>

                                        {systemSettings.maintenance_mode?.enabled && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <Label>Maintenance Message</Label>
                                                <Input
                                                    placeholder="Custom message to show users..."
                                                    value={systemSettings.maintenance_mode?.message}
                                                    onChange={e => setSystemSettings({
                                                        ...systemSettings,
                                                        maintenance_mode: { ...systemSettings.maintenance_mode, message: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={saveSystemSettings} disabled={loading}>
                                        {loading ? "Saving..." : "Save Configuration"}
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Security & Compliance</CardTitle>
                                    <CardDescription>View system transparency reports.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-md border p-4 bg-muted/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Audit Logs</p>
                                                <p className="text-xs text-muted-foreground">Detailed record of all user actions.</p>
                                            </div>
                                            <Button variant="secondary" size="sm" asChild>
                                                <a href="/dashboard/settings/audit-logs">View Logs</a>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="rounded-md border p-4 bg-muted/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Permissions Reference</p>
                                                <p className="text-xs text-muted-foreground">View Role-Based Access Control matrix.</p>
                                            </div>
                                            <Button variant="secondary" size="sm" asChild>
                                                <a href="/dashboard/settings/permissions">View Matrix</a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
