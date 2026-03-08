import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApartmentService } from '@/lib/services/ApartmentService';

// Mock logger
vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ApartmentService', () => {
    let mockSupabase: any;
    let service: ApartmentService;

    const createMockChain = () => {
        const chain: any = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(), // Terminal, return promise
            order: vi.fn(), // Terminal, return promise
            ilike: vi.fn(), // Terminal, return promise
        };
        return chain;
    };

    beforeEach(() => {
        mockSupabase = createMockChain();
        service = new ApartmentService();
    });

    describe('createApartment', () => {
        it('should create an apartment successfully', async () => {
            const newApartment = {
                id: 'apt-123',
                name: 'Sunset Villa',
                price: 1000000,
                status: 'available'
            };

            mockSupabase.single.mockResolvedValue({ data: newApartment, error: null });

            const result = await service.createApartment({
                name: 'Sunset Villa',
                price: 1000000,
                location: 'Lekki'
            }, 'user-123');

            expect(mockSupabase.from).toHaveBeenCalledWith('apartments');
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Sunset Villa',
                status: 'available'
            }));
            expect(result).toEqual(newApartment);
        });

        it('should throw error if creation fails', async () => {
            mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

            await expect(service.createApartment({
                name: 'Fail',
                price: 100
            }, 'user-123')).rejects.toEqual({ message: 'DB Error' });
        });
    });

    describe('updateApartment', () => {
        it('should update apartment successfully', async () => {
            const updatedApartment = { id: 'apt-123', name: 'Updated Name' };
            mockSupabase.single.mockResolvedValue({ data: updatedApartment, error: null });

            const result = await service.updateApartment({
                id: 'apt-123',
                name: 'Updated Name'
            }, 'user-123');

            expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Name' }));
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'apt-123');
            expect(result).toEqual(updatedApartment);
        });
    });

    describe('deleteApartment', () => {
        it('should delete apartment successfully', async () => {
            // delete().eq() is awaited. So eq() must return promise for delete?
            // BaseRepository.delete calls: await this.supabase.from().delete().eq()
            // Here 'eq' is the last call.
            mockSupabase.eq.mockResolvedValue({ error: null });

            const result = await service.deleteApartment('apt-123', 'user-123');

            expect(mockSupabase.delete).toHaveBeenCalled();
            expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'apt-123');
            expect(result).toBe(true);
        });
    });

    describe('getApartments', () => {
        it('should return all apartments ordered by created_at', async () => {
            const apartments = [{ id: '1' }, { id: '2' }];
            // repo.getAll calls: select('*').order(...)
            mockSupabase.order.mockResolvedValue({ data: apartments, error: null });

            const result = await service.getApartments();

            expect(mockSupabase.select).toHaveBeenCalledWith('*');
            expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
            expect(result).toEqual(apartments);
        });
    });

    describe('getApartmentById', () => {
        it('should return apartment if found', async () => {
            const apartment = { id: 'apt-123' };
            // repo.findById calls: select('*').eq().single()
            mockSupabase.single.mockResolvedValue({ data: apartment, error: null });

            const result = await service.getApartmentById('apt-123');
            expect(result).toEqual(apartment);
        });

        it('should throw error if not found', async () => {
            mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'Not found' } });

            await expect(service.getApartmentById('apt-999')).rejects.toThrow();
        });
    });
});
