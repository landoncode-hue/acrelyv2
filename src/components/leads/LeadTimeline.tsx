"use client";

import { useEffect, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Circle,
    Phone,
    CheckCircle2,
    UserCheck,
    XCircle,
    MessageSquare,
    Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TimelineEvent {
    id: string;
    type: 'created' | 'status_changed' | 'note' | 'contacted' | 'converted' | 'lost' | 'assigned';
    timestamp: string;
    actor_name: string;
    content: string;
    metadata?: any;
}

interface LeadTimelineProps {
    leadId: string;
}

export function LeadTimeline({ leadId }: LeadTimelineProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock timeline fetch
        setEvents([]);
        setLoading(false);
    }, [leadId]);

    function getEventIcon(type: TimelineEvent['type']) {
        switch (type) {
            case 'created':
                return <Circle className="h-4 w-4 fill-blue-500 text-blue-500" />;
            case 'status_changed':
                return <Clock className="h-4 w-4 text-purple-500" />;
            case 'note':
                return <MessageSquare className="h-4 w-4 text-gray-500" />;
            case 'contacted':
                return <Phone className="h-4 w-4 text-yellow-500" />;
            case 'converted':
                return <UserCheck className="h-4 w-4 text-green-500" />;
            case 'lost':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'assigned':
                return <CheckCircle2 className="h-4 w-4 text-indigo-500" />;
            default:
                return <Circle className="h-4 w-4 text-gray-500" />;
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Activity Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    {events.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 text-sm">
                            No activity recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event, index) => (
                                <div key={event.id} className="flex gap-3 relative">
                                    {/* Vertical line */}
                                    {index < events.length - 1 && (
                                        <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-border" />
                                    )}

                                    {/* Icon */}
                                    <div className="relative z-10 mt-1 flex-shrink-0">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border">
                                            {getEventIcon(event.type)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-1 pb-4">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm">{event.actor_name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{event.content}</p>
                                        {event.metadata && event.type === 'lost' && event.metadata.lost_reason && (
                                            <p className="text-xs text-muted-foreground italic">
                                                Reason: {event.metadata.lost_reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
