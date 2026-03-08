import { logger } from '@/lib/logger';
import { AppointmentRepository } from '@/lib/repositories/AppointmentRepository';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface CreateAppointmentParams {
    apartmentId: string;
    customerId: string;
    appointmentDate: string;
    notes?: string;
    status?: AppointmentStatus;
}

export interface UpdateAppointmentParams extends Partial<CreateAppointmentParams> {
    id: string;
}

export class AppointmentService {
    private appointmentRepository: AppointmentRepository;

    constructor() {
        this.appointmentRepository = new AppointmentRepository();
    }

    async createAppointment(params: CreateAppointmentParams, actorId: string) {
        logger.info('AppointmentService.createAppointment: Starting', { params, actorId });

        const appointment = await this.appointmentRepository.create({
            apartment_id: params.apartmentId,
            customer_id: params.customerId,
            appointment_date: params.appointmentDate,
            notes: params.notes,
            status: params.status || 'scheduled'
        });

        return appointment;
    }

    async updateAppointment(params: UpdateAppointmentParams, actorId: string) {
        logger.info('AppointmentService.updateAppointment: Starting', { params, actorId });

        const appointment = await this.appointmentRepository.update(params.id, {
            appointment_date: params.appointmentDate,
            notes: params.notes,
            status: params.status
        });

        return appointment;
    }

    async deleteAppointment(id: string, actorId: string) {
        logger.info('AppointmentService.deleteAppointment: Starting', { id, actorId });
        return await this.appointmentRepository.delete(id);
    }

    async getAppointments() {
        return await this.appointmentRepository.getWithDetails();
    }

    async getAppointmentById(id: string) {
        const appointment = await this.appointmentRepository.getByIdWithDetails(id);
        if (!appointment) throw new Error('Appointment not found');
        return appointment;
    }
}
