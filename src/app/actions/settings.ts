'use server';

import { uploadFileBuffer } from '@/lib/storage';
import crypto from 'crypto';

import { getCurrentUser } from '@/lib/auth/session';
import { ProfileService } from '@/lib/services/ProfileService';
import bcrypt from 'bcryptjs';

export async function updatePasswordAction(password: string) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        if (password.length < 8) throw new Error("Password must be at least 8 characters");

        const passwordHash = await bcrypt.hash(password, 10);
        const profileService = new ProfileService();
        await profileService.updatePassword(user.id, passwordHash);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadLogoAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) throw new Error("No file provided");

        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = file.name.split('.').pop() || 'png';
        const objectName = `logo-${crypto.randomUUID()}.${extension}`;

        await uploadFileBuffer('avatars', objectName, buffer, file.type);

        return { success: true, url: `/api/storage/download?bucket=avatars&object=${objectName}` };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function uploadAvatarAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const userId = formData.get("userId") as string;

        if (!file || !userId) throw new Error("Invalid input");

        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = file.name.split('.').pop() || 'png';
        const objectName = `${userId}/avatar-${crypto.randomUUID()}.${extension}`;

        await uploadFileBuffer('avatars', objectName, buffer, file.type);

        return { success: true, url: `/api/storage/download?bucket=avatars&object=${encodeURIComponent(objectName)}` };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
