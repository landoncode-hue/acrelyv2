/**
 * DiceBear Avatar Generation Utilities
 * Provides fallback avatars for users without custom uploads
 */

export type DiceBearStyle = 'initials' | 'avataaars' | 'bottts' | 'pixel-art' | 'lorelei';

export interface DiceBearOptions {
    seed: string;
    style?: DiceBearStyle;
    backgroundColor?: string;
    size?: number;
}

/**
 * Generate a DiceBear avatar URL
 * 
 * @param options - Avatar generation options
 * @returns URL to DiceBear avatar SVG
 */
export function generateDiceBearUrl(options: DiceBearOptions): string {
    const {
        seed,
        style = 'initials',
        backgroundColor,
        size = 128,
    } = options;

    const params = new URLSearchParams({
        seed: seed,
        size: size.toString(),
    });

    if (backgroundColor) {
        params.append('backgroundColor', backgroundColor);
    }

    return `https://api.dicebear.com/7.x/${style}/svg?${params.toString()}`;
}

/**
 * Get avatar URL with fallback chain
 * Priority: custom avatar → DiceBear → default icon
 * 
 * @param profile - User profile with avatar fields
 * @returns Avatar URL
 */
export function getAvatarUrl(profile: {
    avatar_url?: string | null;
    dicebear_seed?: string | null;
    email?: string | null;
    full_name?: string | null;
    id?: string;
}): string {
    // 1. Use custom avatar if available
    if (profile.avatar_url) {
        return profile.avatar_url;
    }

    // 2. Generate DiceBear avatar
    const seed = profile.dicebear_seed || profile.email || profile.full_name || profile.id || 'default';

    return generateDiceBearUrl({
        seed: seed.toLowerCase(),
        style: 'initials',
    });
}

/**
 * Get initials from full name for avatar
 * 
 * @param fullName - User's full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(fullName?: string | null): string {
    if (!fullName) return '?';

    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
