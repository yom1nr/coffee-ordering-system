import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string({ error: "Username is required." })
        .min(3, "Username must be at least 3 characters.")
        .max(100, "Username must be at most 100 characters."),
    password: z
        .string({ error: "Password is required." })
        .min(6, "Password must be at least 6 characters.")
        .max(100, "Password must be at most 100 characters."),
});

export const loginSchema = z.object({
    username: z
        .string({ error: "Username is required." })
        .min(1, "Username is required."),
    password: z
        .string({ error: "Password is required." })
        .min(1, "Password is required."),
});
