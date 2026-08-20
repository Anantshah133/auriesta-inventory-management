import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    product_code: z.string().min(1, "Product code is required"),
    type: z.string().min(1, "Type is required"),
    category_id: z.coerce.number().int().positive("Category ID must be a positive integer"),
    price: z.coerce.number().positive("Price must be a positive number"),
    image_url: z.string().url().nullable().optional(),
    image_public_id: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    manufacturer_id: z.coerce.number().int().positive("Manufacturer ID must be a positive integer"),
});

export const updateProductSchema = createProductSchema.partial();
