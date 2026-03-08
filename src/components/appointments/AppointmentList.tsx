"use client";

import { useState } from "react";
import { Calendar, Search, MapPin, User, Clock, MoreVertical, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { updateAppointmentAction, deleteAppointmentAction } from "@/lib/actions/appointment-actions";
import { useRouter } from "next/navigation";

import { Appointment } from "@/lib/repositories/types";

export function AppointmentList({ initialAppointments }: { initialAppointments: Appointment[] }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const filteredAppointments = initialAppointments.filter(
        (app) =>
            app.customers?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.apartments?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStatusUpdate = async (id: string, status: string) => {
        setIsLoading(id);
        try {
            const result = await updateAppointmentAction({ id, status: status as any });
            if (result.success) {
                toast.success(`Appointment marked as ${status}`);
                router.refresh();
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : "Failed to update status";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this appointment?")) return;

        setIsLoading(id);
        try {
            const result = await deleteAppointmentAction(id);
            if (result.success) {
                toast.success("Appointment deleted");
                router.refresh();
            } else {
                const errorMessage = typeof result.error === 'string' ? result.error : "Failed to delete appointment";
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "scheduled":
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>;
            case "confirmed":
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
            case "completed":
                return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completed</Badge>;
            case "cancelled":
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
            case "no_show":
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">No Show</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by customer or apartment..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Apartment</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAppointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAppointments.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{app.customers?.full_name || "Unknown Customer"}</span>
                                            <span className="text-xs text-muted-foreground">{app.customers?.phone || "No phone"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{app.apartments?.name || "Unknown Apartment"}</span>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <MapPin className="mr-1 h-3 w-3" />
                                                {app.apartments?.location || "No location"}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center text-sm">
                                                <Calendar className="mr-2 h-3 w-3" />
                                                {format(new Date(app.appointment_date), "MMM d, yyyy")}
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Clock className="mr-2 h-3 w-3" />
                                                {format(new Date(app.appointment_date), "p")}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(app.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" disabled={isLoading === app.id}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, "confirmed")}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                    Confirm
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, "completed")}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-gray-600" />
                                                    Complete
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, "no_show")}>
                                                    <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
                                                    No Show
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, "cancelled")}>
                                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                    Cancel
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(app.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function Trash2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
        </svg>
    )
}
