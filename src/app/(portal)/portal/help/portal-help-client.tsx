"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { createTicketAction } from "@/lib/actions/portal-actions";
import { useRouter } from "next/navigation";

interface PortalHelpClientProps {
    initialTickets: any[];
}

export default function PortalHelpClient({ initialTickets }: PortalHelpClientProps) {
    const [submitting, setSubmitting] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = await createTicketAction({
                subject,
                message
            });

            if (result?.success) {
                toast.success("Ticket submitted");
                setSubject("");
                setMessage("");
            } else {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : result?.error?.message || "Failed to submit ticket";
                throw new Error(errorMessage);
            }
        } catch (e: any) {
            toast.error(e.message || "Failed to submit ticket");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Help & Support</h1>
                <p className="text-muted-foreground">How can we help you today?</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Submit Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Open a New Ticket</CardTitle>
                        <CardDescription>We usually respond within 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g. Payment Issue" />
                            </div>
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea value={message} onChange={e => setMessage(e.target.value)} required placeholder="Describe your issue..." className="min-h-[100px]" />
                            </div>
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit Ticket"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Ticket History */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Tickets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                        {initialTickets.map(t => (
                            <div key={t.id} className="p-4 rounded-lg bg-muted/50 border space-y-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold">{t.subject}</h4>
                                    <Badge variant={t.status === 'resolved' ? 'success' : t.status === 'open' ? 'secondary' : 'default'}>
                                        {t.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{t.message}</p>
                                {t.admin_response && (
                                    <div className="mt-2 p-2 bg-primary/5 rounded border-l-2 border-primary text-sm">
                                        <span className="font-semibold text-primary block text-xs mb-1">Response:</span>
                                        {t.admin_response}
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground pt-2 text-right">{new Date(t.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                        {initialTickets.length === 0 && <p className="text-center text-muted-foreground py-8">No tickets yet.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
