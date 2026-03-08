"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { sendBroadcastAction } from "@/lib/actions/communication-actions";
import { useRouter } from "next/navigation";

export default function CampaignsClient({ counts, templates, initialHistory }: any) {
    const router = useRouter();
    const [recipientType, setRecipientType] = useState("all_customers");
    const [channel, setChannel] = useState<"sms" | "email">("sms");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState(""); // For Email
    const [sending, setSending] = useState(false);

    // Session History
    const [history, setHistory] = useState<any[]>(initialHistory);

    const handleSendBroadcast = async () => {
        if (!message) return toast.error("Please enter a message");
        if (channel === 'email' && !subject) return toast.error("Please enter a subject line");

        setSending(true);

        try {
            const result = await sendBroadcastAction({
                recipientType: recipientType as any,
                channel,
                message,
                subject: channel === 'email' ? subject : undefined
            });

            if (result?.error) throw new Error(result.error);
            const data = result?.data;

            toast.success(`Broadcast sent to ${data?.total || 0} recipients. ${data?.sent || 0} delivered, ${data?.failed || 0} failed.`);

            // refresh page to update history
            router.refresh();

            setMessage("");
            setSubject("");
        } catch (e: any) {
            toast.error(e.message || "Failed to send broadcast");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/communications"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <PageHeader title="Campaigns & Broadcasts" description="Send targeted messages to your audience." />
            </div>

            <Tabs defaultValue="compose" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="compose">Compose New</TabsTrigger>
                    <TabsTrigger value="history">Sent History</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Broadcast</CardTitle>
                            <CardDescription>Select audience and compose message.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label>Recipient Group</Label>
                                    <Select value={recipientType} onValueChange={setRecipientType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_customers">All Active Customers ({counts.customers})</SelectItem>
                                            <SelectItem value="all_leads">All Leads ({counts.leads})</SelectItem>
                                            <SelectItem value="debtors">Overdue Customers ({counts.debtors})</SelectItem>
                                            <SelectItem value="staff">All Staff ({counts.staff})</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 w-[140px]">
                                    <Label>Channel</Label>
                                    <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sms">
                                                <div className="flex items-center"><MessageSquare className="w-3 h-3 mr-2" /> SMS</div>
                                            </SelectItem>
                                            <SelectItem value="email">
                                                <div className="flex items-center"><Mail className="w-3 h-3 mr-2" /> Email</div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {channel === 'email' && (
                                <div className="space-y-2">
                                    <Label>Subject Line</Label>
                                    <Input
                                        placeholder="Enter email subject..."
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Message Content</Label>
                                <div className="flex justify-end mb-1">
                                    <Select onValueChange={(val) => {
                                        const template = templates.find((t: any) => t.id === val);
                                        if (template) {
                                            setMessage(template.body || "");
                                            if (channel === 'email' && template.subject) {
                                                setSubject(template.subject);
                                            }
                                        }
                                    }}>
                                        <SelectTrigger className="w-[200px] h-8 text-xs">
                                            <SelectValue placeholder="Load a Template..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {templates.filter((t: any) =>
                                                (channel === 'sms' ? (t.channel === 'sms' || t.name.includes('SMS')) : (t.channel !== 'sms' && !t.name.includes('SMS')))
                                            ).length === 0 ? (
                                                <SelectItem value="none" disabled>No templates found</SelectItem>
                                            ) : (
                                                templates
                                                    .filter((t: any) => (channel === 'sms' ? (t.channel === 'sms' || t.name.includes('SMS')) : (t.channel !== 'sms' && !t.name.includes('SMS'))))
                                                    .map((t: any) => (
                                                        <SelectItem key={t.id} value={t.id}>
                                                            <span className={t.type === 'transactional' ? "text-amber-600" : ""}>
                                                                {t.name} {t.type === 'transactional' && "(Txn)"}
                                                            </span>
                                                        </SelectItem>
                                                    ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Textarea
                                    placeholder={channel === 'email' ? "Design your HTML email here..." : "Type your SMS message..."}
                                    className="min-h-[150px] resize-none font-mono text-sm leading-relaxed"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    maxLength={channel === 'sms' ? 480 : 10000}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                    <span className="font-medium text-blue-600">
                                        Variables: {'{name}'}
                                        {recipientType === 'debtors' && <>, {'{amount}'}, {'{plot_number}'}, {'{estate_name}'}</>}
                                        {channel === 'email' && <>, {'{customer_name}'}</>}
                                    </span>
                                    {channel === 'sms' && (
                                        <span className={message.length > 160 ? "text-orange-500 font-bold" : ""}>
                                            {message.length}/160 (Multipart: {Math.ceil(message.length / 160)})
                                        </span>
                                    )}
                                </div>
                                {(() => {
                                    // Validation Logic
                                    const allVars = (message.match(/\{\{([^}]+)\}\}/g) || []).map(v => v.replace(/[{}]/g, ''));
                                    const allowed = new Set(['name', 'customer_name', 'date']);
                                    if (recipientType === 'debtors') {
                                        allowed.add('amount');
                                        allowed.add('plot_number');
                                        allowed.add('estate_name');
                                        allowed.add('outstanding_balance');
                                    }

                                    const invalid = allVars.filter(v => !allowed.has(v));

                                    if (invalid.length > 0) {
                                        return (
                                            <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-200">
                                                <strong>Warning:</strong> The variables <code>{invalid.join(', ')}</code> will not work for the "{recipientType.replace('_', ' ')}" group. They will appear empty.
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button className="w-full flex-1" onClick={handleSendBroadcast} disabled={sending}>
                                {sending ? <span className="animate-pulse">Queueing...</span> : <><Send className="mr-2 h-4 w-4" /> Send Broadcast</>}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="space-y-4">
                        <Card className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
                            <CardHeader>
                                <CardTitle className="text-base text-blue-800 dark:text-blue-400">Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
                                {channel === 'sms' ? (
                                    <>
                                        <p>• <strong>Cost:</strong> SMS are charged per 160 characters (1 unit).</p>
                                        <p>• <strong>Identify:</strong> Messages start with "Acrely:" automatically.</p>
                                    </>
                                ) : (
                                    <>
                                        <p>• <strong>Format:</strong> Basic HTML is supported.</p>
                                        <p>• <strong>Banner:</strong> All emails use the Pinnacle Builders header automatically.</p>
                                        <p>• <strong>Caution:</strong> Avoid using 'Transactional' templates for bulk marketing.</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {history.length === 0 && (
                                    <p className="text-muted-foreground text-center py-8">No campaigns sent yet.</p>
                                )}
                                {history.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate max-w-[400px]">{item.name || item.message?.substring(0, 50)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                To: <span className="capitalize">{item.recipient_type?.replace('_', ' ')}</span> •
                                                Via: <span className="uppercase">{item.channel}</span> •
                                                {new Date(item.created_at).toLocaleString()}
                                                {item.created_by_name && (
                                                    <span className="ml-2">by {item.created_by_name}</span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono">{item.recipient_count || 0} sent</span>
                                                {item.delivered_count > 0 && (
                                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                        {item.delivered_count} delivered
                                                    </span>
                                                )}
                                                {item.failed_count > 0 && (
                                                    <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                        {item.failed_count} failed
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                item.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                    item.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
