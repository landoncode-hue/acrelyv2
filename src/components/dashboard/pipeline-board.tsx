"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PipelineBoardProps {
    leads: any[];
}

const COLUMNS = [
    { id: 'new', title: 'New Leads', color: 'bg-blue-500/10 text-blue-500 border-blue-200' },
    { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
    { id: 'negotiating', title: 'Negotiating', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    { id: 'closed', title: 'Closed', color: 'bg-green-500/10 text-green-600 border-green-200' },
];

export function PipelineBoard({ leads }: PipelineBoardProps) {
    // Group leads by status
    const getLeadsByStatus = (status: string) => {
        // Map backend status to simplified column IDs if needed, or assume direct mapping
        return leads.filter(l => (l.status || 'new').toLowerCase() === status);
    };

    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-xl pb-4">
            <div className="flex w-max space-x-4 min-w-full">
                {COLUMNS.map(column => (
                    <div key={column.id} className="w-[300px] flex-shrink-0 flex flex-col gap-4">
                        {/* Column Header */}
                        <div className={`p-3 rounded-lg border flex items-center justify-between ${column.color}`}>
                            <span className="font-semibold text-sm">{column.title}</span>
                            <Badge variant="secondary" className="bg-background/50">{getLeadsByStatus(column.id).length}</Badge>
                        </div>

                        {/* Column Content / Droppable Area */}
                        <div className="flex flex-col gap-3 min-h-[500px]">
                            {getLeadsByStatus(column.id).map(lead => (
                                <LeadCard key={lead.id} lead={lead} />
                            ))}
                            {getLeadsByStatus(column.id).length === 0 && (
                                <div className="h-24 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-xs bg-muted/20">
                                    No leads
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

function LeadCard({ lead }: { lead: any }) {
    return (
        <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow relative group">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                                {lead.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold truncate w-[140px]">{lead.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate w-[140px]">{lead.email || 'No email'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dashed">
                    <span className="text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="secondary" className="h-7 text-xs gap-1">
                        <Phone className="h-3 w-3" /> Call
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
