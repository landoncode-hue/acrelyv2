import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommunicationEngine } from '@/lib/communications/engine';
import { CommunicationValidator } from '@/lib/communications/validator';

// Mock dependencies
vi.mock('@/lib/auth/session');
vi.mock('@/lib/communications/validator', () => ({
    CommunicationValidator: {
        validatePhone: vi.fn(),
        validateEmail: vi.fn(),
        checkQuietHours: vi.fn(),
        isDuplicate: vi.fn(),
    }
}));
vi.mock('@/lib/logger');

describe('CommunicationEngine', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSupabase = {
            from: vi.fn(() => mockSupabase),
            select: vi.fn(() => mockSupabase),
            eq: vi.fn(() => mockSupabase),
            single: vi.fn(() => mockSupabase),
            update: vi.fn(() => mockSupabase),
            insert: vi.fn(() => mockSupabase),
            functions: {
                invoke: vi.fn().mockResolvedValue({ data: {}, error: null })
            }
        };


        // Default validator behavior (all valid)
        (CommunicationValidator.validatePhone as any).mockReturnValue({ valid: true });
        (CommunicationValidator.validateEmail as any).mockReturnValue({ valid: true });
        (CommunicationValidator.checkQuietHours as any).mockReturnValue({ valid: true });
    });

    it('should send via primary channel successfully', async () => {
        // Mock template and recipient
        mockSupabase.single
            .mockResolvedValueOnce({ data: { name: 'test-tmpl', body: 'Hello {{customer_name}}', type: 'transactional' }, error: null }) // template
            .mockResolvedValueOnce({ data: { id: 'user-1', full_name: 'John Doe', phone: '12345', email: 'john@test.com', role: 'customer' }, error: null }) // recipient
            .mockResolvedValueOnce({ id: 'log-1' }); // insert log single

        const result = await CommunicationEngine.send({
            templateName: 'test-tmpl',
            customerId: 'cust-1',
            data: {}
        });

        expect(result.success).toBe(true);
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('send-message', expect.objectContaining({
            body: expect.objectContaining({ channel: 'sms' })
        }));
    });

    it('should failover to email if sms fails', async () => {
        // Mock template and recipient
        mockSupabase.single
            .mockResolvedValueOnce({ data: { name: 'test-tmpl', body: 'Hello', type: 'transactional' }, error: null })
            .mockResolvedValueOnce({ data: { full_name: 'John Doe', phone: '12345', email: 'john@test.com' }, error: null })
            .mockResolvedValueOnce({ id: 'log-1' });

        // Primary channel (SMS) fails after all retries (3 attempts total)
        mockSupabase.functions.invoke
            .mockRejectedValueOnce(new Error('SMS Provider Down')) // SMS Attempt 1
            .mockRejectedValueOnce(new Error('SMS Provider Down')) // SMS Attempt 2 (Retry 1)
            .mockRejectedValueOnce(new Error('SMS Provider Down')) // SMS Attempt 3 (Retry 2)
            .mockResolvedValueOnce({ data: {}, error: null });     // Email Attempt 1 (Failover)

        const result = await CommunicationEngine.send({
            templateName: 'test-tmpl',
            customerId: 'cust-1',
            data: {}
        });

        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('sms: SMS Provider Down');

        // Verify retry logic was used (3 for SMS + 1 for Email)
        expect(mockSupabase.functions.invoke).toHaveBeenCalledTimes(4);
        expect(mockSupabase.functions.invoke).toHaveBeenLastCalledWith('send-message', expect.objectContaining({
            body: expect.objectContaining({ channel: 'email' })
        }));
    });

    it('should enforce quiet hours by switching to silent channel', async () => {
        mockSupabase.single
            .mockResolvedValueOnce({ data: { name: 'test-tmpl', body: 'Hello', type: 'transactional' }, error: null })
            .mockResolvedValueOnce({ data: { full_name: 'John Doe', phone: '12345', email: 'john@test.com' }, error: null })
            .mockResolvedValueOnce({ id: 'log-1' });

        // Mock quiet hours violation
        (CommunicationValidator.checkQuietHours as any).mockReturnValue({ valid: false, reason: 'Quiet hours enforced' });

        const result = await CommunicationEngine.send({
            templateName: 'test-tmpl',
            customerId: 'cust-1',
            data: {}
        });

        expect(result.success).toBe(true);
        // Primary was SMS, but switched to Email due to quiet hours
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('send-message', expect.objectContaining({
            body: expect.objectContaining({ channel: 'email' })
        }));
    });

    it('should retry with exponential backoff on transient errors', async () => {
        const mockFn = vi.fn()
            .mockRejectedValueOnce(new Error('Transient Error'))
            .mockRejectedValueOnce(new Error('Transient Error'))
            .mockResolvedValueOnce('Success');

        // We use a small delay for tests
        const result = await CommunicationEngine.withRetries(mockFn, 2, 10);

        expect(result).toBe('Success');
        expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on permanent errors (4xx)', async () => {
        const error: any = new Error('Not Found');
        error.status = 404;
        const mockFn = vi.fn().mockRejectedValue(error);

        await expect(CommunicationEngine.withRetries(mockFn, 3, 10)).rejects.toThrow('Not Found');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
