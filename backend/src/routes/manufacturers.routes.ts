import { Router } from "express";
import {
    createManufacturer,
    deleteManufacturer,
    getManufacturer,
    getManufacturers,
    updateManufacturer,
} from "../controllers/manufacturers.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const manufacturersRoutes = Router();

manufacturersRoutes.get("/", authenticate, getManufacturers);
manufacturersRoutes.get("/:id", authenticate, getManufacturer);
manufacturersRoutes.post("/", authenticate, requireAdmin, createManufacturer);
manufacturersRoutes.patch("/:id", authenticate, requireAdmin, updateManufacturer);
manufacturersRoutes.delete("/:id", authenticate, requireAdmin, deleteManufacturer);

export default manufacturersRoutes;
