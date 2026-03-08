import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { StaffService } from "@/lib/services/StaffService";
import { ProfileService } from "@/lib/services/ProfileService";
import { StaffClient } from "./staff-client";

export default async function StaffPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    const profileService = new ProfileService();
    const profile = await profileService.getProfile(user.id);

    // Only Admin Access
    if (!profile || !['sysadmin', 'ceo', 'md'].includes(profile.role)) {
        return <div className="flex h-[400px] items-center justify-center text-muted-foreground">Unauthorized</div>;
    }

    const staffService = new StaffService();
    const staff = await staffService.getAllStaff();

    return (
        <StaffClient
            initialStaff={JSON.parse(JSON.stringify(staff))}
            currentUserProfile={JSON.parse(JSON.stringify(profile))}
        />
    );
}
