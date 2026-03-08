import { z } from "zod";

export const CreateEstateSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    location: z.string().optional(),
    price: z.number().positive("Price must be positive"),
    totalPlots: z.number().int().nonnegative(),
    imageUrls: z.array(z.string().url()).optional()
});

export type CreateEstateValues = z.infer<typeof CreateEstateSchema>;
