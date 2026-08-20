import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { createCategorySchema, updateCategorySchema } from "../validators/categories.schemas.js";

// GET /api/categories
export async function getCategories(_req: Request, res: Response) {
    try {
        const categories = await prisma.category.findMany();
        return res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ error: "Failed to fetch categories" });
    }
}

// GET /api/categories/:id
export async function getCategory(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    try {
        const category = await prisma.category.findUnique({
            where: { id }
        });
        if (!category) return res.status(404).json({ error: "Category not found" });
        return res.json(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        return res.status(500).json({ error: "Failed to fetch category" });
    }
}

// POST /api/categories
export async function createCategory(req: Request, res: Response) {
    const parsedBody = createCategorySchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    try {
        const category = await prisma.category.create({
            data: parsedBody.data as any
        });
        return res.status(201).json(category);
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ error: "Failed to create category" });
    }
}

// PATCH /api/categories/:id
export async function updateCategory(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    const parsedBody = updateCategorySchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    try {
        const category = await prisma.category.update({
            where: { id },
            data: parsedBody.data as any
        });
        return res.json(category);
    } catch (error: any) {
        console.error("Error updating category:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: "Category not found" });
        return res.status(500).json({ error: "Failed to update category" });
    }
}

// DELETE /api/categories/:id
export async function deleteCategory(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    try {
        await prisma.category.delete({ where: { id } });
        return res.status(204).send();
    } catch (error: any) {
        console.error("Error deleting category:", error);
        if (error.code === 'P2025') return res.status(404).json({ error: "Category not found" });
        return res.status(500).json({ error: "Failed to delete category" });
    }
}
