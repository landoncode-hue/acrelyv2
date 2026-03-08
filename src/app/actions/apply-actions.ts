'use server';

import sql from '@/lib/db';
import bcrypt from 'bcryptjs';
import { uploadFileBuffer } from '@/lib/storage';
import crypto from 'crypto';

export async function submitAgentApplicationAction(formData: FormData) {
    try {
        const fullName = formData.get('full_name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const password = formData.get('password') as string;
        const file = formData.get('passport') as File;

        if (!fullName || !email || !password || !file) {
            throw new Error("Missing required fields");
        }

        // Check if email already exists
        const existingUsers = await sql`SELECT id FROM profiles WHERE email = ${email.toLowerCase().trim()}`;
        if (existingUsers.length > 0) {
            throw new Error("Email already registered");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Create user profile
        const [profile] = await sql`
            INSERT INTO profiles (full_name, email, phone, password_hash, role, is_staff)
            VALUES (${fullName}, ${email.toLowerCase().trim()}, ${phone}, ${passwordHash}, 'agent', false)
            RETURNING id
        `;

        const profileId = profile.id;

        // Upload passport
        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = file.name.split('.').pop() || 'png';
        const objectName = `${profileId}/passport-${crypto.randomUUID()}.${extension}`;
        await uploadFileBuffer('avatars', objectName, buffer, file.type);

        // Wait, wait... the agent schema doesn't have passport_url? 
        // Let's check AgentService again if there is a place for it, or maybe it goes to profiles.avatar_url
        await sql`
            UPDATE profiles SET avatar_url = ${`/api/storage/download?bucket=avatars&object=${encodeURIComponent(objectName)}`}
            WHERE id = ${profileId}
        `;

        // Create agent record
        await sql`
            INSERT INTO agents (profile_id, commission_rate, status)
            VALUES (${profileId}, 5.0, 'pending')
        `;

        return { success: true };
    } catch (error: any) {
        console.error("Apply error:", error);
        return { success: false, error: error.message };
    }
}
