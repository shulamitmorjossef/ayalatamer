import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth";
import { uploadProfileImage } from "../middlewares/upload";
import {
  getMyProfile,
  updateMyProfile,
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
} from "../controllers/user.controller";
import { AppError } from "../utils/AppError";

const router = Router();

function adminOnly(req: any, _res: any, next: any) {
  if (!req.auth) return next(new AppError("Unauthorized", 401));
  if (req.auth.role !== "ADMIN") return next(new AppError("Forbidden", 403));
  next();
}

// פרופיל שלי
router.get("/me", authMiddleware, asyncHandler(getMyProfile));

// עדכון פרופיל שלי (עם תמונה)
router.put(
  "/me",
  authMiddleware,
  uploadProfileImage.single("profileImage"),
  asyncHandler(updateMyProfile)
);

/* ===== Admin ===== */

// רשימת משתמשים
router.get("/", authMiddleware, adminOnly, asyncHandler(adminListUsers));

// עדכון משתמש + (אופציונלי) תמונה/הרשאות/role
router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  uploadProfileImage.single("profileImage"),
  asyncHandler(adminUpdateUser)
);

// מחיקת משתמש
router.delete("/:id", authMiddleware, adminOnly, asyncHandler(adminDeleteUser));

export default router;
