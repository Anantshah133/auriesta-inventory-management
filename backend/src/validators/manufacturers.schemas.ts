import { z } from "zod";

export const createManufacturerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean().optional(),
});

export const updateManufacturerSchema = createManufacturerSchema.partial();
