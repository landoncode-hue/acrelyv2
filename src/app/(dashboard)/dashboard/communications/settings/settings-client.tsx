"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateSystemSettingsAction } from "@/lib/actions/settings-actions";
import { useRouter } from "next/navigation";

const QuietHoursVisualizer = ({ start, end }: { start: string, end: string }) => {
    // Convert times to percent of day (0-100)
    const getPercent = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return ((h * 60 + m) / (24 * 60)) * 100;
    };

    const startP = getPercent(start);
    const endP = getPercent(end);

    // If quiet hours wrap around midnight (e.g. 21:00 to 08:00)
    const isOvernight = startP > endP;

    return (
        <div className="relative h-12 bg-green-100 rounded-md overflow-hidden border border-green-200">
            {/* Active Hours Label (Background) */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-green-700 pointer-events-none uppercase tracking-widest">
                Active Sending Hours
            </div>

            {/* Quiet Period(s) */}
            {isOvernight ? (
                <>
                    {/* Before Midnight */}
                    <div
                        className="absolute top-0 bottom-0 bg-indigo-950/90 backdrop-blur-[1px] flex items-center justify-center border-l border-indigo-900 overflow-hidden"
                        style={{ left: `${startP}%`, right: 0 }}
                    >
                        <span className="text-[10px] text-white/50 truncate px-1">Quiet Zzz</span>
                    </div>
                    {/* After Midnight */}
                    <div
                        className="absolute top-0 bottom-0 left-0 bg-indigo-950/90 backdrop-blur-[1px] flex items-center justify-center border-r border-indigo-900 overflow-hidden"
                        style={{ width: `${endP}%` }}
                    >
                        <span className="text-[10px] text-white/50 truncate px-1">Quiet Zzz</span>
                    </div>
                </>
            ) : (
                <div
                    className="absolute top-0 bottom-0 bg-indigo-950/90 backdrop-blur-[1px] flex items-center justify-center border-x border-indigo-900 overflow-hidden"
                    style={{ left: `${startP}%`, width: `${Math.abs(endP - startP)}%` }}
                >
                    <span className="text-[10px] text-white/50">Quiet Hours</span>
                </div>
            )}

            {/* Markers */}
            {[0, 6, 12, 18, 24].map(hour => (
                <div key={hour} className="absolute top-0 bottom-0 border-r border-black/5" style={{ left: `${(hour / 24) * 100}%` }}>
                    <span className="absolute bottom-1 right-1 text-[9px] text-black/40">{hour === 24 ? '00' : hour}:00</span>
                </div>
            ))}
        </div>
    );
};

interface CommunicationSettingsClientProps {
    initialSettings: {
        reminders: boolean;
        receipts: boolean;
        escalation: boolean;
        quietHoursStart: string;
        quietHoursEnd: string;
    }
}

export default function CommunicationSettingsClient({ initialSettings }: CommunicationSettingsClientProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(initialSettings);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = [
                { key: 'comm_reminders', value: settings.reminders },
                { key: 'comm_receipts', value: settings.receipts },
                { key: 'comm_escalation', value: settings.escalation },
                { key: 'comm_quiet_start', value: settings.quietHoursStart },
                { key: 'comm_quiet_end', value: settings.quietHoursEnd }
            ];

            const result = await updateSystemSettingsAction({ updates });

            if (result?.error) throw new Error(typeof result.error === "string" ? result.error : (result.error as any).message || "Action failed");

            toast.success("Configuration saved successfully.");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to update templates");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Communication Settings</h2>
                    <p className="text-muted-foreground">Manage automation rules and contact hours.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Automation Rules
                        </CardTitle>
                        <CardDescription>Configure when automated messages are sent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <Label htmlFor="reminders" className="flex flex-col space-y-1 cursor-pointer">
                                <span>Enable Payment Reminders</span>
                                <span className="font-normal text-xs text-muted-foreground">Automatically send reminders 3 days before due date.</span>
                            </Label>
                            <Switch
                                id="reminders"
                                checked={settings.reminders}
                                onCheckedChange={(c) => setSettings({ ...settings, reminders: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <Label htmlFor="receipts" className="flex flex-col space-y-1 cursor-pointer">
                                <span>Auto-Send Receipts</span>
                                <span className="font-normal text-xs text-muted-foreground">Email receipt immediately after payment confirmation.</span>
                            </Label>
                            <Switch
                                id="receipts"
                                checked={settings.receipts}
                                onCheckedChange={(c) => setSettings({ ...settings, receipts: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <Label htmlFor="escalation" className="flex flex-col space-y-1 cursor-pointer">
                                <span>Manager Escalation</span>
                                <span className="font-normal text-xs text-muted-foreground">Notify admins when a payment is 14 days overdue.</span>
                            </Label>
                            <Switch
                                id="escalation"
                                checked={settings.escalation}
                                onCheckedChange={(c) => setSettings({ ...settings, escalation: c })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            Quiet Hours
                        </CardTitle>
                        <CardDescription>Prevent non-urgent messages during these hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-1">
                        <QuietHoursVisualizer start={settings.quietHoursStart} end={settings.quietHoursEnd} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Quiet Time (PM)</Label>
                                <div className="relative">
                                    <Input
                                        type="time"
                                        value={settings.quietHoursStart}
                                        onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                                        className="font-mono"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Messages pause starting now.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>End Quiet Time (AM)</Label>
                                <Input
                                    type="time"
                                    value={settings.quietHoursEnd}
                                    onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                                    className="font-mono"
                                />
                                <p className="text-[10px] text-muted-foreground">Messages resume after this.</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800 flex flex-col gap-1">
                            <span className="font-semibold">Note:</span>
                            During quiet hours, only "Urgent" transactional messages (like OTPs or Payment Confirmations) will be delivered. Marketing and reminders will be queued until the active window resumes.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
