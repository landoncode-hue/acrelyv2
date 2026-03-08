import { logger } from '@/lib/logger';
import { ApartmentRepository } from '@/lib/repositories/ApartmentRepository';

export interface ApartmentMedia {
    images: string[];
    videos: string[];
}

export interface CreateApartmentParams {
    name: string;
    location?: string;
    amenities?: string[];
    price: number;
    media?: ApartmentMedia;
}

export interface UpdateApartmentParams extends Partial<CreateApartmentParams> {
    id: string;
}

export class ApartmentService {
    private apartmentRepository: ApartmentRepository;

    constructor() {
        this.apartmentRepository = new ApartmentRepository();
    }

    async createApartment(params: CreateApartmentParams, actorId: string) {
        logger.info('ApartmentService.createApartment: Starting', { params, actorId });

        const apartment = await this.apartmentRepository.create({
            name: params.name,
            location: params.location,
            amenities: params.amenities || [],
            price: params.price,
            media: params.media || { images: [], videos: [] },
            status: 'available' // Default status
        });

        return apartment;
    }

    async updateApartment(params: UpdateApartmentParams, actorId: string) {
        logger.info('ApartmentService.updateApartment: Starting', { params, actorId });

        const apartment = await this.apartmentRepository.update(params.id, {
            name: params.name,
            location: params.location,
            amenities: params.amenities,
            price: params.price,
            media: params.media
        });

        return apartment;
    }

    async deleteApartment(id: string, actorId: string) {
        logger.info('ApartmentService.deleteApartment: Starting', { id, actorId });
        return await this.apartmentRepository.delete(id);
    }

    async getApartments() {
        return await this.apartmentRepository.getAll();
    }

    async getApartmentById(id: string) {
        const apartment = await this.apartmentRepository.findById(id);
        if (!apartment) throw new Error('Apartment not found');
        return apartment;
    }
}
