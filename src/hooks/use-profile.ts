"use client";

import { useState } from "react";

export interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: "sysadmin" | "ceo" | "md" | "frontdesk" | "agent" | "customer";
    is_staff: boolean;
    avatar_url?: string;
}

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);

    return { profile, loading };
}
