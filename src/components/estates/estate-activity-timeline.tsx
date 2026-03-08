"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Building2,
    DollarSign,
    Archive,
    Edit,
    Plus,
    User,
    Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
    id: string;
    action_type: string;
    actor_name: string;
    actor_role: string;
    changes: any;
    created_at: string;
}

interface EstateActivityTimelineProps {
    estateId: string;
}

export function EstateActivityTimeline({ estateId }: EstateActivityTimelineProps) {
    const [events, setEvents] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTimeline = useCallback(async () => {
        setLoading(false);
    }, [estateId]);

    useEffect(() => {
        const init = async () => {
            await fetchTimeline();
        };
        void init();
    }, [fetchTimeline]);

    function getEventIcon(actionType: string) {
        if (actionType.includes('created')) return Building2;
        if (actionType.includes('price')) return DollarSign;
        if (actionType.includes('archived')) return Archive;
        if (actionType.includes('updated')) return Edit;
        if (actionType.includes('plot')) return Plus;
        return Clock;
    }

    function getEventColor(actionType: string) {
        if (actionType.includes('created')) return 'text-green-500';
        if (actionType.includes('price')) return 'text-blue-500';
        if (actionType.includes('archived')) return 'text-gray-500';
        if (actionType.includes('updated')) return 'text-yellow-500';
        return 'text-muted-foreground';
    }

    function formatEventDescription(event: ActivityEvent) {
        const { action_type, changes } = event;

        if (action_type === 'estate.created') {
            return `Created estate "${changes?.created?.name}"`;
        }

        if (action_type === 'estate.price_changed') {
            const oldPrice = changes?.old?.price;
            const newPrice = changes?.new?.price;
            return `Changed base price from ₦${oldPrice?.toLocaleString()} to ₦${newPrice?.toLocaleString()}`;
        }

        if (action_type === 'estate.archived') {
            return `Archived estate${changes?.new?.archive_reason ? `: ${changes.new.archive_reason}` : ''}`;
        }

        if (action_type === 'estate.status_changed') {
            return `Changed status from ${changes?.old?.status} to ${changes?.new?.status}`;
        }

        if (action_type === 'estate.renamed') {
            return `Renamed from "${changes?.old?.name}" to "${changes?.new?.name}"`;
        }

        return `Updated estate`;
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No activity recorded yet
                    </p>
                ) : (
                    <div className="relative space-y-6">
                        {/* Timeline line */}
                        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                        {events.map((event, index) => {
                            const Icon = getEventIcon(event.action_type);
                            const colorClass = getEventColor(event.action_type);

                            return (
                                <div key={event.id} className="relative flex gap-4">
                                    {/* Icon */}
                                    <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-card ${colorClass}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 pt-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {formatEventDescription(event)}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    <span>{event.actor_name}</span>
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1">
                                                        {event.actor_role}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <time className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
