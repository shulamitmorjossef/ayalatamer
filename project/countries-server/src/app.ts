import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import countryRoutes from "./routes/country.routes";
import cityRoutes from "./routes/city.routes";
import userRoutes from "./routes/user.routes";
import permissionRequestRoutes from "./routes/permissionRequest.routes";

import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

const uploadsDir = process.env.UPLOADS_DIR ?? "uploads";
app.use(`/${uploadsDir}`, express.static(path.join(process.cwd(), uploadsDir)));

/* ===== Middlewares ===== */
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== Routes ===== */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/permission-requests", permissionRequestRoutes);

/* ===== Health Check ===== */
app.get("/health", (_req, res) => res.send("Server is running"));

/* ===== Not Found + Error Handler ===== */
app.use(notFound);
app.use(errorHandler);
