import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentService } from '@/lib/services/AppointmentService';

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('AppointmentService', () => {
    let mockSupabase: any;
    let service: AppointmentService;

    const createMockChain = () => {
        const chain: any = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(), // Terminal
            order: vi.fn(), // Terminal
        };
        return chain;
    };

    beforeEach(() => {
        mockSupabase = createMockChain();
        service = new AppointmentService();
    });

    describe('createAppointment', () => {
        it('should create appointment successfully', async () => {
            const newAppointment = { id: 'appt-1', status: 'scheduled' };
            mockSupabase.single.mockResolvedValue({ data: newAppointment, error: null });

            const result = await service.createAppointment({
                apartmentId: 'apt-1',
                customerId: 'cust-1',
                appointmentDate: '2023-01-01'
            }, 'user-1');

            expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                apartment_id: 'apt-1',
                customer_id: 'cust-1'
            }));
            expect(result).toEqual(newAppointment);
        });
    });

    describe('getAppointments', () => {
        it('should return appointments with details', async () => {
            // getWithDetails calls select(long string).order()
            const appointments = [{ id: '1', apartments: {}, customers: {} }];
            mockSupabase.order.mockResolvedValue({ data: appointments, error: null });

            const result = await service.getAppointments();

            expect(mockSupabase.select).toHaveBeenCalled();
            expect(mockSupabase.order).toHaveBeenCalledWith('appointment_date', { ascending: true });
            expect(result).toEqual(appointments);
        });
    });

    describe('getAppointmentById', () => {
        it('should return appointment with details', async () => {
            // getByIdWithDetails calls select().eq().single()
            const appointment = { id: '1', apartments: {}, customers: {} };
            mockSupabase.single.mockResolvedValue({ data: appointment, error: null });

            const result = await service.getAppointmentById('1');

            expect(mockSupabase.select).toHaveBeenCalled();
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
            expect(result).toEqual(appointment);
        });
    });
});
