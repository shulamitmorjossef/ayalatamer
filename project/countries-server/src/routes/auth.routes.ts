// file: src/routes/auth.routes.ts
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { signup, login, me, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";
import { loginRateLimit } from "../middlewares/loginRateLimit";
import { uploadProfileImage } from "../middlewares/upload";

const router = Router();

// ✅ SIGNUP חייב multer כי הפרונט שולח FormData (multipart/form-data)
router.post(
  "/signup",
  uploadProfileImage.single("profileImage"),
  asyncHandler(signup)
);

router.post("/login", loginRateLimit, asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(me));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));

export default router;
