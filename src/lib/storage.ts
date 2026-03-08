import * as Minio from 'minio';
import { logger } from '@/lib/logger';

// Ensure the required environment variables are present or use fallbacks for testing
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';

// Initialize the MinIO client
export const storageClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
});

/**
 * Standard buckets used in the application
 */
export const BUCKETS = {
    KYC: 'kyc-documents',
    RECEIPTS: 'receipts',
    AVATARS: 'avatars',
    DOCUMENTS: 'documents',
};

/**
 * Ensure a bucket exists, creating it if necessary.
 * @param bucketName Name of the bucket to check/create
 */
export async function ensureBucketExists(bucketName: string): Promise<void> {
    try {
        const exists = await storageClient.bucketExists(bucketName);
        if (!exists) {
            await storageClient.makeBucket(bucketName);
            logger.info(`MinIO: Created missing bucket '${bucketName}'`);
        }
    } catch (error) {
        logger.error(`MinIO: Error ensuring bucket '${bucketName}' exists:`, error);
        throw error;
    }
}

/**
 * Generate a pre-signed URL for uploading a file directly from the browser.
 * @param bucketName Name of the target bucket
 * @param objectName The path/name of the file to be stored
 * @param expiry Expiry time in seconds (default 1 hour)
 * @returns A pre-signed URL for PUT requests
 */
export async function getPresignedUploadUrl(bucketName: string, objectName: string, expiry: number = 3600): Promise<string> {
    try {
        await ensureBucketExists(bucketName);
        const url = await storageClient.presignedPutObject(bucketName, objectName, expiry);
        return url;
    } catch (error) {
        logger.error(`MinIO: Error generating presigned upload URL for '${objectName}':`, error);
        throw error;
    }
}

/**
 * Generate a pre-signed URL for downloading or viewing a file.
 * @param bucketName Name of the bucket
 * @param objectName The path/name of the file to download
 * @param expiry Expiry time in seconds (default 1 hour)
 * @returns A pre-signed URL for GET requests
 */
export async function getPresignedDownloadUrl(bucketName: string, objectName: string, expiry: number = 3600): Promise<string> {
    try {
        const url = await storageClient.presignedGetObject(bucketName, objectName, expiry);
        return url;
    } catch (error) {
        logger.error(`MinIO: Error generating presigned download URL for '${objectName}':`, error);
        throw error;
    }
}

/**
 * Upload a file directly from the backend server.
 * @param bucketName Name of the target bucket
 * @param objectName The path/name of the file to be stored
 * @param fileBuffer The raw buffer of the file or stream
 * @param contentType The MIME type of the file
 * @returns The versionId or ETag of the uploaded object
 */
export async function uploadFileBuffer(
    bucketName: string,
    objectName: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream'
) {
    try {
        await ensureBucketExists(bucketName);

        const metaData = {
            'Content-Type': contentType,
        };

        const result = await storageClient.putObject(bucketName, objectName, fileBuffer, undefined, metaData);
        logger.info(`MinIO: Successfully uploaded '${objectName}' to bucket '${bucketName}'`);
        return result;
    } catch (error) {
        logger.error(`MinIO: Error uploading buffer for '${objectName}':`, error);
        throw error;
    }
}

/**
 * Remove a file from MinIO storage.
 * @param bucketName Name of the bucket
 * @param objectName The path/name of the file to remove
 */
export async function removeFile(bucketName: string, objectName: string): Promise<void> {
    try {
        await storageClient.removeObject(bucketName, objectName);
        logger.info(`MinIO: Successfully deleted '${objectName}' from bucket '${bucketName}'`);
    } catch (error) {
        logger.error(`MinIO: Error removing file '${objectName}':`, error);
        throw error;
    }
}
