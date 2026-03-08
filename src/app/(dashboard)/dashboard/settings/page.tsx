import { getCurrentUser } from "@/lib/auth/session";
import { ProfileService } from "@/lib/services/ProfileService";
import { AgentService } from "@/lib/services/AgentService";
import { SettingsService } from "@/lib/services/SettingsService";
import SettingsClient from "./settings-client";
import { notFound } from "next/navigation";

const profileService = new ProfileService();
const agentService = new AgentService();
const settingsService = new SettingsService();

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        return notFound();
    }

    const [profile, settings, logoUrl] = await Promise.all([
        profileService.getProfile(user.id),
        settingsService.getSystemSettings(),
        settingsService.getLogoUrl()
    ]);

    if (!profile) {
        return notFound();
    }

    let agentDetails = null;
    if (profile.role === 'agent') {
        agentDetails = await agentService.getByProfileId(profile.id);
    }

    return (
        <SettingsClient
            initialProfile={profile}
            initialAgentDetails={agentDetails}
            initialSystemSettings={settings}
            initialLogoUrl={logoUrl}
        />
    );
}
