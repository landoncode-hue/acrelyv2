"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Phone, MessageCircle, Mail, XCircle } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin-delete-button";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { LeadStatus } from "@/lib/repositories/types";
import { LeadSourceBadge } from "@/components/leads/LeadSourceBadge";
import { LeadTimeline } from "@/components/leads/LeadTimeline";
import { FollowUpScheduler } from "@/components/leads/FollowUpScheduler";
import { ConvertToCustomerModal } from "@/components/leads/ConvertToCustomerModal";
import { MarkAsLostModal } from "@/components/leads/MarkAsLostModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { addLeadNoteAction } from "@/lib/actions/leads-actions";

export function LeadDetailClient({ lead }: { lead: any }) {
    const router = useRouter();
    const [convertOpen, setConvertOpen] = useState(false);
    const [lostOpen, setLostOpen] = useState(false);
    const [noteContent, setNoteContent] = useState("");
    const [submittingNote, setSubmittingNote] = useState(false);
    const { profile } = useProfile();

    const handleCreateNote = async () => {
        if (!noteContent.trim()) return;
        setSubmittingNote(true);

        try {
            const result = await addLeadNoteAction(lead.id, noteContent);
            if (!result.success) throw new Error("Failed");

            toast.success("Note added");
            setNoteContent("");
            router.refresh();
        } catch (e: any) {
            toast.error("Failed to add note.");
        } finally {
            setSubmittingNote(false);
        }
    };

    if (!lead) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 bg-muted rounded-full">
                    <XCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Lead not found</h2>
                    <p className="text-muted-foreground mt-1">
                        The lead you are looking for doesn't exist or has been deleted.
                    </p>
                </div>
                <Button asChild variant="default" size="lg">
                    <Link href="/dashboard/leads">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
                    </Link>
                </Button>
            </div>
        );
    }

    const agentProfile = Array.isArray(lead.profiles) ? lead.profiles[0] : lead.profiles;
    const isOverdue = !!(lead.next_follow_up_at &&
        new Date(lead.next_follow_up_at) < new Date() &&
        !['converted', 'lost'].includes(lead.status));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/leads">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{lead.full_name}</h1>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <LeadStatusBadge status={lead.status as LeadStatus} />
                        <LeadSourceBadge source={lead.source} />
                        {lead.source_detail && (
                            <Badge variant="outline" className="text-xs">
                                {lead.source_detail}
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground ml-2">
                            Added {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Quick Actions */}
                    <Button variant="outline" size="sm" onClick={() => window.open(`tel:${lead.phone}`)}>
                        <Phone className="mr-2 h-4 w-4" /> Call
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`)}>
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                    {lead.email && (
                        <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${lead.email}`)}>
                            <Mail className="mr-2 h-4 w-4" /> Email
                        </Button>
                    )}

                    {/* Convert/Lost Actions */}
                    {lead.status !== 'converted' && lead.status !== 'lost' && (
                        <>
                            <Button onClick={() => setConvertOpen(true)}>
                                Convert to Customer
                            </Button>
                            <Button variant="outline" onClick={() => setLostOpen(true)}>
                                <XCircle className="mr-2 h-4 w-4" /> Mark as Lost
                            </Button>
                        </>
                    )}

                    <AdminDeleteButton
                        table="leads"
                        itemId={lead.id}
                        resourceName={`Lead ${lead.full_name}`}
                        redirectUrl="/dashboard/leads"
                    />
                </div>
            </div>

            {/* Overdue Alert */}
            {isOverdue && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-5 w-5" />
                        <span className="font-semibold">Follow-up Overdue!</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        This lead's follow-up was due {lead.next_follow_up_at ? formatDistanceToNow(new Date(lead.next_follow_up_at), { addSuffix: true }) : 'N/A'}.
                        Please contact them as soon as possible.
                    </p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Phone
                            </span>
                            <span className="font-mono text-sm">{lead.phone}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email
                            </span>
                            <span className="font-mono text-sm">{lead.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground">Interest</span>
                            <span>{lead.interest}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                            {agentProfile ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                            {agentProfile.full_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{agentProfile.full_name}</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-sm">Unassigned</span>
                            )}
                        </div>
                        {lead.last_contacted_at && (
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <span className="text-sm font-medium text-muted-foreground">Last Contacted</span>
                                <span className="text-sm">
                                    {formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Follow-Up Scheduler */}
                <FollowUpScheduler
                    leadId={lead.id}
                    currentFollowUpAt={lead.next_follow_up_at}
                    onUpdate={() => router.refresh()}
                />
            </div>

            {/* Notes Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Add Note</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Add a note about this lead..."
                        className="min-h-[80px] resize-none"
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleCreateNote} disabled={submittingNote}>
                            {submittingNote ? 'Saving...' : 'Post Note'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <LeadTimeline leadId={lead.id} />

            {/* Modals */}
            <ConvertToCustomerModal
                open={convertOpen}
                onOpenChange={setConvertOpen}
                lead={{
                    id: lead.id,
                    full_name: lead.full_name,
                    phone: lead.phone,
                    email: lead.email,
                    interest: lead.interest
                }}
            />

            <MarkAsLostModal
                open={lostOpen}
                onOpenChange={setLostOpen}
                lead={{
                    id: lead.id,
                    full_name: lead.full_name
                }}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
