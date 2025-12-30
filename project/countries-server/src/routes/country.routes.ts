import { Router } from 'express';
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  fetchExternalCountries
} from '../controllers/country.controller';

const router = Router();

/* ===== Country CRUD Routes ===== */

// שליפת כל המדינות
router.get('/', getAllCountries);

// שליפת מדינה לפי מזהה
router.get('/:id', getCountryById);

// יצירת מדינה חדשה
router.post('/', createCountry);

// עדכון מדינה קיימת לפי מזהה
router.put('/:id', updateCountry);

// מחיקת מדינה לפי מזהה
router.delete('/:id', deleteCountry);

/* ===== Fetch External Countries ===== */

// טעינת מדינות ממקור חיצוני ושמירה במסד (אם לא קיימות)
router.post('/fetch-external', fetchExternalCountries);

export default router;
