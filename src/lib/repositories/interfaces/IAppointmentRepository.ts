import { IRepository } from './IRepository';
import { Appointment } from '../types';

export interface IAppointmentRepository extends IRepository<Appointment> {
    findByApartmentId(apartmentId: string): Promise<Appointment[]>;
    findByCustomerId(customerId: string): Promise<Appointment[]>;
    findByDateRange(startDate: string, endDate: string): Promise<Appointment[]>;
    updateStatus(id: string, status: Appointment['status']): Promise<Appointment | null>;
    getWithDetails(): Promise<Appointment[]>;
    getByIdWithDetails(id: string): Promise<Appointment | null>;
}
