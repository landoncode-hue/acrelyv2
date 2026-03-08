import { vi, beforeAll, afterAll } from 'vitest';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local for tests
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Mock global next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}));

// Mock global logger to avoid noise in tests
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

beforeAll(() => {
    // Global setup if needed
});

afterAll(() => {
    // Global teardown if needed
});
