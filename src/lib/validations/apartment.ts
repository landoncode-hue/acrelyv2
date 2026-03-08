import { z } from "zod";

export const CreateApartmentSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    location: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    price: z.number().positive("Price must be positive"),
    media: z.object({
        images: z.array(z.string()).default([]),
        videos: z.array(z.string()).default([])
    }).default({ images: [], videos: [] })
});

export const UpdateApartmentSchema = CreateApartmentSchema.extend({
    id: z.string().uuid()
});

export type CreateApartmentValues = z.infer<typeof CreateApartmentSchema>;
export type UpdateApartmentValues = z.infer<typeof UpdateApartmentSchema>;
