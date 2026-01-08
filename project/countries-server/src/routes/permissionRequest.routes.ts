import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middlewares/auth";
import {
  createPermissionRequest,
  myPermissionRequests,
  adminListPending,
  adminMarkRead,
  adminDecide,
} from "../controllers/permissionRequest.controller";

const router = Router();

// USER
router.post("/", authMiddleware, asyncHandler(createPermissionRequest));
router.get("/me", authMiddleware, asyncHandler(myPermissionRequests));

// ADMIN
router.get("/admin/pending", authMiddleware, asyncHandler(adminListPending));
router.patch("/admin/:id/read", authMiddleware, asyncHandler(adminMarkRead));
router.patch("/admin/:id/decide", authMiddleware, asyncHandler(adminDecide));

export default router;
