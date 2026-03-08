import { AppointmentService } from "@/lib/services/AppointmentService";
import { AppointmentList } from "@/components/appointments/AppointmentList";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import Link from "next/link";

const appointmentService = new AppointmentService();

export default async function AppointmentsPage() {
    const appointments = await appointmentService.getAppointments();

    return (
        <div className="space-y-8">
            <PageHeader
                title="Appointments"
                description="Manage customer visits and property viewings."
                actions={
                    <Button asChild>
                        <Link href="/dashboard/appointments/new">
                            <CalendarPlus className="mr-2 h-4 w-4" />
                            Schedule Appointment
                        </Link>
                    </Button>
                }
            />
            <AppointmentList initialAppointments={appointments} />
        </div>
    );
}
