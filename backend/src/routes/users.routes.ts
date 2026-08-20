import { Router } from "express";
import { createUser, listUsers, login } from "../controllers/users.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const usersRoutes = Router();

usersRoutes.get("/", authenticate, requireAdmin, listUsers);
usersRoutes.post("/", createUser);
usersRoutes.post("/login", login);

export default usersRoutes;
