import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { createProductSchema, updateProductSchema } from "../validators/products.schemas.js";
import cloudinary from "../config/cloudinary.js";

const uploadImageToCloudinary = async (buffer: Buffer, mimetype: string): Promise<any> => {
    const b64 = buffer.toString('base64');
    const dataURI = "data:" + mimetype + ";base64," + b64;
    return await cloudinary.uploader.upload(dataURI, {
        folder: "auriesta/products"
    });
};

// GET /api/products
export async function getProducts(req: Request, res: Response) {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Number(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const search = req.query.search as string;
        const manufacturerId = req.query.manufacturerId ? Number(req.query.manufacturerId) : undefined;
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

        const where: any = {};

        if (search && search.length >= 3) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { product_code: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (manufacturerId) {
            where.manufacturer_id = manufacturerId;
        }

        if (categoryId) {
            where.category_id = categoryId;
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: { category: true, manufacturer: true },
                orderBy: { created_at: 'desc' }
            }),
            prisma.product.count({ where })
        ]);

        return res.json({
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ error: "Failed to fetch products" });
    }
}

// GET /api/products/:id
export async function getProduct(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true, manufacturer: true }
        });
        if (!product) return res.status(404).json({ error: "Product not found" });
        return res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ error: "Failed to fetch product" });
    }
}

// POST /api/products
export async function createProduct(req: Request, res: Response) {
    const parsedBody = createProductSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    try {
        const existingProduct = await prisma.product.findUnique({ where: { product_code: parsedBody.data.product_code } });
        if (existingProduct) return res.status(409).json({ error: "Product code already exists" });

        const data: any = { ...parsedBody.data };

        if (req.file) {
            const uploadResult = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
            data.image_url = uploadResult.secure_url;
            data.image_public_id = uploadResult.public_id;
        }

        const product = await prisma.product.create({
            data,
            include: { category: true, manufacturer: true }
        });
        return res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ error: "Failed to create product" });
    }
}

// PATCH /api/products/:id
export async function updateProduct(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    const parsedBody = updateProductSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    try {
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) return res.status(404).json({ error: "Product not found" });

        const data: any = { ...parsedBody.data };

        if (req.file) {
            const uploadResult = await uploadImageToCloudinary(req.file.buffer, req.file.mimetype);
            data.image_url = uploadResult.secure_url;
            data.image_public_id = uploadResult.public_id;

            if (existingProduct.image_public_id) {
                await cloudinary.uploader.destroy(existingProduct.image_public_id).catch(err => {
                    console.error("Failed to delete old image from Cloudinary", err);
                });
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data,
            include: { category: true, manufacturer: true }
        });
        return res.json(product);
    } catch (error: any) {
        console.error("Error updating product:", error);
        return res.status(500).json({ error: "Failed to update product" });
    }
}

// DELETE /api/products/:id
export async function deleteProduct(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (product.image_public_id) {
            await cloudinary.uploader.destroy(product.image_public_id).catch(err => {
                console.error("Failed to delete image from Cloudinary", err);
            });
        }

        await prisma.product.delete({ where: { id } });
        return res.status(204).send();
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ error: "Failed to delete product" });
    }
}
