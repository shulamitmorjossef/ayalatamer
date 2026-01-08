import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth";
import { requirePermission } from "../middlewares/authorize";
import {
  getCitiesByCountry,
  createCity,
  updateCity,
  deleteCity,
} from "../controllers/city.controller";

const router = Router();

// רשימת ערים לפי מדינה
router.get(
  "/by-country/:countryId",
  authMiddleware,
  requirePermission("cities", "read"),
  asyncHandler(getCitiesByCountry)
);

// יצירת עיר
router.post(
  "/",
  authMiddleware,
  requirePermission("cities", "create"),
  asyncHandler(createCity)
);

// עדכון עיר
router.put(
  "/:id",
  authMiddleware,
  requirePermission("cities", "update"),
  asyncHandler(updateCity)
);

// מחיקת עיר
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("cities", "delete"),
  asyncHandler(deleteCity)
);

export default router;
