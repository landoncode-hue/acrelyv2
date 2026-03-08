"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FollowUpSchedulerProps {
    leadId: string;
    currentFollowUpAt?: string | null;
    onUpdate?: () => void;
}

export function FollowUpScheduler({
    leadId,
    currentFollowUpAt,
    onUpdate
}: FollowUpSchedulerProps) {
    const [date, setDate] = useState<Date | undefined>(
        currentFollowUpAt ? new Date(currentFollowUpAt) : undefined
    );
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        if (!date) {
            toast.error("Please select a follow-up date");
            return;
        }

        // Prevent setting follow-up in the past
        if (date < new Date()) {
            toast.error("Follow-up date cannot be in the past");
            return;
        }

        setSaving(true);

        try {
            toast.error("Follow-up scheduling is currently disabled");
            onUpdate?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to schedule follow-up");
        } finally {
            setSaving(false);
        }
    }

    function setQuickDate(days: number) {
        const newDate = addDays(new Date(), days);
        setDate(newDate);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule Follow-Up
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Presets */}
                <div className="space-y-2">
                    <Label>Quick Presets</Label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickDate(1)}
                        >
                            Tomorrow
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickDate(3)}
                        >
                            In 3 Days
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickDate(7)}
                        >
                            Next Week
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuickDate(14)}
                        >
                            In 2 Weeks
                        </Button>
                    </div>
                </div>

                {/* Custom Date Picker */}
                <div className="space-y-2">
                    <Label>Custom Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Current Follow-up Display */}
                {currentFollowUpAt && (
                    <div className="text-sm text-muted-foreground">
                        Current follow-up: {format(new Date(currentFollowUpAt), "PPP")}
                    </div>
                )}

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    disabled={saving || !date}
                    className="w-full"
                >
                    {saving ? "Saving..." : "Schedule Follow-Up"}
                </Button>
            </CardContent>
        </Card>
    );
}
