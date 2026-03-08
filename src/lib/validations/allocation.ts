import { z } from "zod";

export const CreateAllocationSchema = z.object({
    customerId: z.string().uuid(),
    estateId: z.string().uuid(),
    plots: z.array(z.object({
        id: z.string().nullable().refine(val => val === null || val === 'unassigned' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val || '')),
        plot_number: z.string(),
        price: z.number(),
        size: z.enum(['full_plot', 'half_plot']),
        preferredSuffix: z.string().optional(),
    })),
    planType: z.string(),
    plotSize: z.enum(['full_plot', 'half_plot']),
    agentId: z.string().nullable().optional(),
    notes: z.string().optional(),
    allocationDate: z.string().optional(),
    initialPayment: z.object({
        amount: z.number(),
        method: z.string(),
        reference: z.string().optional(),
        date: z.string().optional(),
    }).optional(),
    customPrice: z.number().optional()
});

export type CreateAllocationValues = z.infer<typeof CreateAllocationSchema>;
