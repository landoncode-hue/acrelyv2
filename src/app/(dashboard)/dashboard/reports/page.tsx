import { redirect } from "next/navigation";
import { ReportsView } from "./reports-view";
import { Profile } from "@/hooks/use-profile";
import { getCurrentUser } from "@/lib/auth/session";
import { ProfileService } from "@/lib/services/ProfileService";

const profileService = new ProfileService();

export default async function ReportsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await profileService.getProfile(user.id);

    if (!profile || !["sysadmin", "ceo", "md", "frontdesk"].includes(profile.role)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">Unauthorized Access</h1>
                    <p className="text-muted-foreground mt-2">
                        Only staff members can access reports.
                    </p>
                </div>
            </div>
        );
    }

    return <ReportsView profile={profile as unknown as Profile} />;
}
