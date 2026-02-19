import { z } from "zod";

export const createProductSchema = z.object({
    name: z
        .string({ error: "Product name is required." })
        .min(1, "Product name is required.")
        .max(255),
    base_price: z
        .number({ error: "Base price is required." })
        .nonnegative("Price must be non-negative."),
    image_url: z.string().url().max(500).nullable().optional(),
    category: z
        .string({ error: "Category is required." })
        .min(1, "Category is required.")
        .max(100),
});

export const updateProductSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    base_price: z.number().nonnegative().optional(),
    image_url: z.string().url().max(500).nullable().optional(),
    category: z.string().min(1).max(100).optional(),
    is_active: z.boolean().optional(),
});
