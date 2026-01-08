import { Router } from "express";
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  fetchExternalCountries,
} from "../controllers/country.controller";

import { authMiddleware } from "../middlewares/auth";
import { requirePermission } from "../middlewares/authorize";

const router = Router();

// Seed / fetch from external (מכניס נתונים ל-DB => נחשב create)
router.post(
  "/fetch-external",
  authMiddleware,
  requirePermission("countries", "create"),
  fetchExternalCountries
);

// Read
router.get(
  "/",
  authMiddleware,
  requirePermission("countries", "read"),
  getAllCountries
);

router.get(
  "/:id",
  authMiddleware,
  requirePermission("countries", "read"),
  getCountryById
);

// Create
router.post(
  "/",
  authMiddleware,
  requirePermission("countries", "create"),
  createCountry
);

// Update
router.put(
  "/:id",
  authMiddleware,
  requirePermission("countries", "update"),
  updateCountry
);

// Delete
router.delete(
  "/:id",
  authMiddleware,
  requirePermission("countries", "delete"),
  deleteCountry
);

export default router;
