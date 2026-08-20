import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.string().trim().email("A valid email is required").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    role: z.string().trim().min(1, "Role is required").max(50),
});

export const loginSchema = z.object({
    email: z.string().trim().email("A valid email is required").max(255),
    password: z.string().min(1, "Password is required").max(128),
});