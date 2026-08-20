import cors from "cors";
import express from "express";
import productsRoutes from "./routes/products.routes.js";
import usersRoutes from "./routes/users.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import manufacturersRoutes from "./routes/manufacturers.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ message: "Auriesta API is running" });
});

app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/manufacturers", manufacturersRoutes);

export default app;
