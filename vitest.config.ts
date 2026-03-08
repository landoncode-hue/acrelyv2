import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup/vitest-setup.ts'],
        include: ['tests/**/*.test.ts'],
        exclude: ['tests/e2e/**', 'node_modules/**'],
        testTimeout: 30000, // Increased timeout for DB operations
        hookTimeout: 30000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/**',
                'tests/**',
                '.next/**',
                'playwright-report/**',
                'test-results/**',
                'coverage/**',
                '*.config.*',

                'scripts/**',
                'public/**',
                'supabase/migrations/**',
                '**/*.d.ts',
                '**/*.spec.ts',
                '**/*.test.ts',
            ],
            thresholds: {
                statements: 70,
                branches: 70,
                functions: 70,
                lines: 70,
            },
            include: ['src/**/*.{ts,tsx}'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), './src'),
        },
    },
});
