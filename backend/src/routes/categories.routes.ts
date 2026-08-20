import { Router } from "express";
import {
    createCategory,
    deleteCategory,
    getCategory,
    getCategories,
    updateCategory,
} from "../controllers/categories.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const categoriesRoutes = Router();

categoriesRoutes.get("/", authenticate, getCategories);
categoriesRoutes.get("/:id", authenticate, getCategory);
categoriesRoutes.post("/", authenticate, requireAdmin, createCategory);
categoriesRoutes.patch("/:id", authenticate, requireAdmin, updateCategory);
categoriesRoutes.delete("/:id", authenticate, requireAdmin, deleteCategory);

export default categoriesRoutes;
