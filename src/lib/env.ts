import { z } from 'zod';

const envSchema = z.object({
    POSTGRES_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    MINIO_ENDPOINT: z.string(),
    MINIO_PORT: z.string().regex(/^\d+$/).optional().default("9000").transform(Number),
    MINIO_USE_SSL: z.string().optional().default("false").transform(val => val === 'true'),
    MINIO_ACCESS_KEY: z.string(),
    MINIO_SECRET_KEY: z.string(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().email().optional().default('no-reply@acrely.com'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    throw new Error('Invalid environment variables. Check console for details.');
}

export const env = _env.data;
