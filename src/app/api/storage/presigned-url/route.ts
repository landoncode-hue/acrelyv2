import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth/session';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { bucket, filename, contentType } = body;

        if (!bucket || !filename) {
            return NextResponse.json({ error: 'Bucket and filename are required' }, { status: 400 });
        }

        // Validate allowed buckets
        const allowedBuckets = ['kyc-documents', 'receipts', 'avatars', 'documents'];
        if (!allowedBuckets.includes(bucket)) {
            return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
        }

        // Sanitize and namespace the filename with a unique UUID to prevent overwriting
        const extension = filename.split('.').pop() || '';
        const safeString = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const baseName = safeString.substring(0, safeString.lastIndexOf('.')) || safeString;
        const uniqueId = crypto.randomUUID();
        const objectName = `${user.id}/${baseName}-${uniqueId}.${extension}`;

        const url = await getPresignedUploadUrl(bucket, objectName);

        return NextResponse.json({
            success: true,
            url,
            objectName,
            bucket,
            downloadUrl: `/api/storage/download?bucket=${bucket}&object=${encodeURIComponent(objectName)}`,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
