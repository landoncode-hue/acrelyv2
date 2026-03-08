"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { Bell, MessageSquare, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationsPage() {
    const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
    const { profile } = useProfile();

    if (loading) return <Skeleton className="h-[400px] w-full" />;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>

            <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Mark All as Read
                </Button>
            </div>

            <div className="grid gap-4">
                {loading && [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}

                {!loading && notifications.map((notif) => (
                    <Card
                        key={notif.id}
                        className={`transition-all hover:bg-muted/5 cursor-pointer ${notif.is_read ? "opacity-60 bg-muted/10 border-transparent shadow-none" : "border-l-4 border-l-primary shadow-sm"}`}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base flex items-center gap-2">
                                    {!notif.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                                    {notif.title}
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">{new Date(notif.created_at).toLocaleString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80">{notif.message}</p>
                        </CardContent>
                    </Card>
                ))}

                {!loading && notifications.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground bg-muted/10 rounded-xl">
                        <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
