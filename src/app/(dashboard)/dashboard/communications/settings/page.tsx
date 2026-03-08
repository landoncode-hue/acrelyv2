import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import CommunicationSettingsClient from "./settings-client";
import { SettingsService } from "@/lib/services/SettingsService";

export default async function CommunicationSettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const { role } = user;
    if (!['sysadmin', 'ceo', 'md'].includes(role || "")) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Unauthorized - Admin access required</p>
            </div>
        );
    }

    const settingsService = new SettingsService();
    const dbSettings = await settingsService.getSystemSettings();

    const initialSettings = {
        reminders: dbSettings.comm_reminders === 'true' || dbSettings.comm_reminders === true,
        receipts: dbSettings.comm_receipts === 'true' || dbSettings.comm_receipts === true,
        escalation: dbSettings.comm_escalation === 'true' || dbSettings.comm_escalation === true,
        quietHoursStart: dbSettings.comm_quiet_start || "21:00",
        quietHoursEnd: dbSettings.comm_quiet_end || "07:00"
    };

    return <CommunicationSettingsClient initialSettings={initialSettings} />;
}
