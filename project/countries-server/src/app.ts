import express from "express";
import cors from "cors";

import countryRoutes from "./routes/country.routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

/* ===== Middlewares ===== */
app.use(cors({ origin: "http://localhost:5173" })); // בפיתוח אפשר גם app.use(cors())
app.use(express.json());

/* ===== Routes ===== */
app.use("/api/countries", countryRoutes);

/* ===== Health Check ===== */
app.get("/health", (_req, res) => {
  res.send("Server is running");
});

/* ===== Not Found + Error Handler (חייבים בסוף) ===== */
app.use(notFound);
app.use(errorHandler);
