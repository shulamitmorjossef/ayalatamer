import { Router } from "express";
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  fetchExternalCountries,
} from "../controllers/country.controller";

const router = Router();

/* ===== External Fetch ===== */
// טעינת מדינות ממקור חיצוני ושמירה במסד (אם לא קיימות)
router.post("/fetch-external", fetchExternalCountries);

/* ===== Country CRUD Routes ===== */
// שליפת כל המדינות
router.get("/", getAllCountries);

// יצירת מדינה חדשה
router.post("/", createCountry);

// שליפת מדינה לפי מזהה
router.get("/:id", getCountryById);

// עדכון מדינה קיימת לפי מזהה
router.put("/:id", updateCountry);

// מחיקת מדינה לפי מזהה
router.delete("/:id", deleteCountry);

export default router;
