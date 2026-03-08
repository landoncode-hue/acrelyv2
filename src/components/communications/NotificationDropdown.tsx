"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-600 text-[10px] m-0 p-0 text-white animate-pulse">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary h-auto px-2 hover:bg-transparent"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notif.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                                    )}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", !notif.is_read && "text-primary")}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
