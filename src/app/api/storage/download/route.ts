import { NextRequest, NextResponse } from 'next/server';
import { getPresignedDownloadUrl } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const bucket = request.nextUrl.searchParams.get('bucket');
        const objectName = request.nextUrl.searchParams.get('object');

        if (!bucket || !objectName) {
            return NextResponse.json({ error: 'Bucket and object parameters are required' }, { status: 400 });
        }

        // Basic authorization: ensure users can only access their own files OR staff can access everything
        if (!user.is_staff && !objectName.startsWith(`${user.id}/`)) {
            logger.warn(`Unauthorized access attempt by ${user.id} to ${bucket}/${objectName}`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const url = await getPresignedDownloadUrl(bucket, objectName);

        // Redirect the user directly to the presigned MinIO URL
        return NextResponse.redirect(url);
    } catch (error: any) {
        logger.error(`Error in /api/storage/download:`, error);
        return NextResponse.json(
            { error: 'File not found or internal server error' },
            { status: 500 }
        );
    }
}
