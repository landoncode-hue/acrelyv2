import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadLogo() {
    const filePath = path.resolve(process.cwd(), 'public/pinnacle-logo.png');

    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }

    const fileBuffer = fs.readFileSync(filePath);

    console.log('Uploading pinnacle-logo.png to avatars bucket...');

    const { data, error } = await supabase.storage
        .from('avatars')
        .upload('pinnacle-logo.png', fileBuffer, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
        console.error('Upload failed:', error);
    } else {
        console.log('Upload successful:', data);
    }
}

uploadLogo();
