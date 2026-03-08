import sql from '@/lib/db';
import { BaseRepository } from './BaseRepository';
import { IAppointmentRepository } from './interfaces/IAppointmentRepository';
import { Appointment } from './types';
import { logger } from '@/lib/logger';

export class AppointmentRepository extends BaseRepository<Appointment> implements IAppointmentRepository {
    constructor() {
        super('appointments');
    }

    async findByApartmentId(apartmentId: string): Promise<Appointment[]> {
        try {
            const data = await sql<Appointment[]>`
                SELECT * FROM appointments
                WHERE apartment_id = ${apartmentId}
            `;
            return data;
        } catch (error) {
            logger.error(`AppointmentRepository.findByApartmentId error`, error);
            throw error;
        }
    }

    async findByCustomerId(customerId: string): Promise<Appointment[]> {
        try {
            const data = await sql<Appointment[]>`
                SELECT * FROM appointments
                WHERE customer_id = ${customerId}
            `;
            return data;
        } catch (error) {
            logger.error(`AppointmentRepository.findByCustomerId error`, error);
            throw error;
        }
    }

    async findByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
        try {
            const data = await sql<Appointment[]>`
                SELECT * FROM appointments
                WHERE appointment_date >= ${startDate}
                AND appointment_date <= ${endDate}
            `;
            return data;
        } catch (error) {
            logger.error(`AppointmentRepository.findByDateRange error`, error);
            throw error;
        }
    }

    async updateStatus(id: string, status: Appointment['status']): Promise<Appointment | null> {
        try {
            const [data] = await sql<Appointment[]>`
                UPDATE appointments
                SET status = ${status}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;
            return data || null;
        } catch (error) {
            logger.error(`AppointmentRepository.updateStatus error`, error);
            throw error;
        }
    }

    async getWithDetails(): Promise<Appointment[]> {
        try {
            const data = await sql<any[]>`
                SELECT 
                    ap.*,
                    json_build_object('name', apt.name, 'location', apt.location) as apartments,
                    json_build_object('full_name', c.full_name, 'phone', c.phone) as customers
                FROM appointments ap
                LEFT JOIN apartments apt ON ap.apartment_id = apt.id
                LEFT JOIN customers c ON ap.customer_id = c.id
                ORDER BY ap.appointment_date ASC
            `;
            return data;
        } catch (error) {
            logger.error(`AppointmentRepository.getWithDetails error`, error);
            throw error;
        }
    }

    async getByIdWithDetails(id: string): Promise<Appointment | null> {
        try {
            const [data] = await sql<any[]>`
                SELECT 
                    ap.*,
                    json_build_object(
                        'id', apt.id, 
                        'name', apt.name, 
                        'location', apt.location,
                        'status', apt.status,
                        'created_at', apt.created_at,
                        'updated_at', apt.updated_at
                    ) as apartments,
                    json_build_object(
                        'id', c.id, 
                        'full_name', c.full_name, 
                        'phone', c.phone,
                        'email', c.email,
                        'created_at', c.created_at,
                        'updated_at', c.updated_at
                    ) as customers
                FROM appointments ap
                LEFT JOIN apartments apt ON ap.apartment_id = apt.id
                LEFT JOIN customers c ON ap.customer_id = c.id
                WHERE ap.id = ${id}
            `;
            return data || null;
        } catch (error) {
            logger.error(`AppointmentRepository.getByIdWithDetails error`, error);
            throw error;
        }
    }
}
