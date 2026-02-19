import { z } from "zod";

const orderItemSchema = z.object({
    id: z.number({ error: "Product ID is required." }).int().positive(),
    quantity: z.number({ error: "Quantity is required." }).int().min(1, "Quantity must be at least 1."),
    selectedOptions: z.array(
        z.object({
            name: z.string(),
            price: z.number(),
            group: z.string(),
        })
    ).default([]),
    base_price: z.number().nonnegative(),
    totalPrice: z.number().nonnegative(),
});

export const createOrderSchema = z.object({
    items: z
        .array(orderItemSchema)
        .min(1, "Cart must contain at least 1 item."),
    customerName: z.string().max(255).optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["pending", "approved", "cancelled"], {
        error: "Invalid status. Must be one of: pending, approved, cancelled.",
    }),
});
