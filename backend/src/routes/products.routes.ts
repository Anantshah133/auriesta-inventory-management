import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
} from "../controllers/products.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

import upload from "../config/multer.js";

const productsRoutes = Router();

productsRoutes.get("/", authenticate, getProducts);
productsRoutes.get("/:id", authenticate, getProduct);
productsRoutes.post("/", authenticate, requireAdmin, upload.single("image"), createProduct);
productsRoutes.patch("/:id", authenticate, requireAdmin, upload.single("image"), updateProduct);
productsRoutes.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default productsRoutes;
