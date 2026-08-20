import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { createUserSchema, loginSchema } from "../validators/auth.schemas.js";

export async function createUser(req: Request, res: Response) {
    const parsedBody = createUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    const { name, password, role } = parsedBody.data;
    const email = parsedBody.data.email.toLowerCase();

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(409).json({ error: "Email is already registered" });

        const password_hash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email, password_hash, role },
            select: { id: true, name: true, email: true, role: true, created_at: true },
        });
        return res.status(201).json({ user });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ error: "Failed to create user" });
    }
}

export async function login(req: Request, res: Response) {
    const parsedBody = loginSchema.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(400).json({ error: "Invalid request body", details: parsedBody.error.flatten().fieldErrors });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ error: "Authentication is not configured" });

    try {
        const email = parsedBody.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        const passwordMatches = user ? await bcrypt.compare(parsedBody.data.password, user.password_hash) : false;

        if (!user || !passwordMatches) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "1h" });

        return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at } });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Failed to log in" });
    }
}

export async function listUsers(_req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, created_at: true },
        });
        return res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
}
