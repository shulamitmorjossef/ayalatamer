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

// מידלוור פנימי לבדיקת אדמין
function adminOnly(req: any, _res: any, next: any) {
  if (!req.auth) return next(new AppError("Unauthorized", 401));
  if (req.auth.role !== "ADMIN") return next(new AppError("Forbidden", 403));
  next();
}

// נתיבים
router.get("/me", authMiddleware, asyncHandler(getMyProfile));
router.put("/me", authMiddleware, uploadProfileImage.single("profileImage"), asyncHandler(updateMyProfile));

/* Admin Only */
router.get("/", authMiddleware, adminOnly, asyncHandler(adminListUsers));
router.put("/:id", authMiddleware, adminOnly, uploadProfileImage.single("profileImage"), asyncHandler(adminUpdateUser));
router.delete("/:id", authMiddleware, adminOnly, asyncHandler(adminDeleteUser));

export default router;