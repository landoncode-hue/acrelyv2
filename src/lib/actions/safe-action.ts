import { z } from "zod";

export type ActionState<T> = {
    data?: T;
    error?: any;
    success?: boolean;
};

export function safeAction<Schema extends z.ZodTypeAny, T>(
    schema: Schema,
    handler: (data: z.infer<Schema>) => Promise<T>
) {
    return async (input: z.infer<Schema>): Promise<ActionState<T>> => {
        try {
            const validatedInput = schema.parse(input);
            const data = await handler(validatedInput);
            return { data, success: true };
        } catch (error: any) {
            console.error("Action Error:", error);
            if (error instanceof z.ZodError) {
                return {
                    error: {
                        message: "Validation failed",
                        details: error.issues
                    },
                    success: false
                };
            }
            return {
                error: error.message || "An unexpected error occurred",
                success: false
            };
        }
    };
}
