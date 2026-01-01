import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 1) Mongoose: ObjectId לא תקין
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: "Invalid country ID" });
  }

  // 2) Mongo: Duplicate key (unique)
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Country already exists" });
  }

  // 3) שגיאה כללית
  const statusCode = typeof err?.statusCode === "number" ? err.statusCode : 500;

  return res.status(statusCode).json({
    message: err?.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err?.stack } : {}),
  });
};
