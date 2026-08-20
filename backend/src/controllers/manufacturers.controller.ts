import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { createManufacturerSchema, updateManufacturerSchema } from "../validators/manufacturers.schemas.js";

// GET /api/manufacturers
export async function getManufacturers(_req: Request, res: Response) {
    try {
        const manufacturers = await prisma.manufacturer.findMany();
        return res.json(manufacturers);
    } catch (error) {
        console.error("Error fetching manufacturers:", error);
        return res.status(500).json({ error: "Failed to fetch manufacturers" });
    }
}

// GET /api/manufacturers/:id
export async function getManufacturer(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    try {
        const manufacturer = await prisma.manufacturer.findUnique({
            where: { id }
        });
        if (!manufacturer) return res.status(404).json({ error: "Manufacturer not found" });
        return res.json(manufacturer);
    } catch (error) {
        console.error("Error fetching manufacturer:", error);
        return res.status(500).json({ error: "Failed to fetch manufacturer" });
    }
}

// POST /api/manufacturers
export async function createManufacturer(req: Request, res: Response) {
    const parsedBody = createManufacturerSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    try {
        const manufacturer = await prisma.manufacturer.create({
            data: parsedBody.data as any
        });
        return res.status(201).json(manufacturer);
    } catch (error) {
        console.error("Error creating manufacturer:", error);
        return res.status(500).json({ error: "Failed to create manufacturer" });
    }
}

// PATCH /api/manufacturers/:id
export async function updateManufacturer(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    const parsedBody = updateManufacturerSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    try {
        const manufacturer = await prisma.manufacturer.update({
            where: { id },
            data: parsedBody.data as any
        });
        return res.json(manufacturer);
    } catch (error: any) {
        console.error("Error updating manufacturer:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: "Manufacturer not found" });
        return res.status(500).json({ error: "Failed to update manufacturer" });
    }
}

// DELETE /api/manufacturers/:id
export async function deleteManufacturer(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    try {
        await prisma.manufacturer.delete({ where: { id } });
        return res.status(204).send();
    } catch (error: any) {
        console.error("Error deleting manufacturer:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: "Manufacturer not found" });
        return res.status(500).json({ error: "Failed to delete manufacturer" });
    }
}
