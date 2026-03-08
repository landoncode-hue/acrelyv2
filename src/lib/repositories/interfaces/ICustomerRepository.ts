import { IRepository } from './IRepository';
import { Customer } from '../types';

export interface ICustomerRepository extends IRepository<Customer> {
    findByEmail(email: string): Promise<Customer | null>;
    findByPhone(phone: string): Promise<Customer | null>;
    findByProfileId(profileId: string): Promise<Customer | null>;
    findByEmailOrPhone(email?: string, phone?: string): Promise<Customer | null>;
    findByIdWithDetails(id: string): Promise<any>;
    findKycRequests(): Promise<Customer[]>;
    findCustomersForMetrics(): Promise<any[]>;
}
