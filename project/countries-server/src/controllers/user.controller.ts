import type { Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";

/* ========= Helpers ========= */
function requireAuth(req: Request) {
  if (!req.auth) throw new AppError("Unauthorized", 401);
}

function requireAdmin(req: Request) {
  requireAuth(req);
  if (req.auth!.role !== "ADMIN") throw new AppError("Forbidden", 403);
}

/* ========= ME ========= */
export async function getMyProfile(req: Request, res: Response) {
  requireAuth(req);

  const user = await User.findById(req.auth!.sub).select(
    "username role firstName lastName phone profileImagePath permissions createdAt updatedAt"
  );

  if (!user) throw new AppError("User not found", 404);

  res.json({
    id: user._id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    profileImagePath: user.profileImagePath,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export async function updateMyProfile(req: Request, res: Response) {
  requireAuth(req);

  const { firstName, lastName, phone } = req.body as {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };

  const file = (req as any).file as Express.Multer.File | undefined;
  const uploadsDir = process.env.UPLOADS_DIR ?? "uploads";
  const profileImagePath = file ? `/${uploadsDir}/profiles/${file.filename}` : undefined;

  const update: any = {};
  if (firstName !== undefined) update.firstName = firstName;
  if (lastName !== undefined) update.lastName = lastName;
  if (phone !== undefined) update.phone = phone;
  if (profileImagePath !== undefined) update.profileImagePath = profileImagePath;

  const user = await User.findByIdAndUpdate(req.auth!.sub, update, { new: true }).select(
    "username role firstName lastName phone profileImagePath permissions createdAt updatedAt"
  );

  if (!user) throw new AppError("User not found", 404);

  res.json({
    id: user._id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    profileImagePath: user.profileImagePath,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

/* ========= ADMIN ========= */
export async function adminListUsers(_req: Request, res: Response) {
  // authMiddleware רץ לפני — אז req.auth קיים כאן
  // אבל עדיין נבדוק:
  // (אם את רוצה, אפשר להעביר req ולהשתמש requireAdmin)
  const users = await User.find().select(
    "username role firstName lastName email phone profileImagePath permissions createdAt updatedAt"
  ).sort({ createdAt: -1 });

  res.json(
    users.map((u) => ({
      id: u._id,
      username: u.username,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      profileImagePath: u.profileImagePath,
      permissions: u.permissions,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))
  );
}

export async function adminUpdateUser(req: Request, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid user id", 400);
  }

  const { firstName, lastName, phone, role, permissions } = req.body as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: "ADMIN" | "USER";
    permissions?: any;
  };

  const update: any = {};

  // ===== טקסטים עם trim =====
  if (firstName !== undefined) {
    update.firstName = String(firstName).trim();
  }

  if (lastName !== undefined) {
    update.lastName = String(lastName).trim();
  }

  if (phone !== undefined) {
    update.phone = String(phone).trim();
  }

  // ===== role / permissions =====
  if (role !== undefined) {
    update.role = role;
  }

  if (permissions !== undefined) {
    update.permissions = permissions;
  }

  // ===== תמונת פרופיל (אם נשלחה) =====
  const file = (req as any).file as Express.Multer.File | undefined;
  if (file) {
    const uploadsDir = process.env.UPLOADS_DIR ?? "uploads";
    update.profileImagePath = `/${uploadsDir}/profiles/${file.filename}`;
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
    "username role firstName lastName email phone profileImagePath permissions createdAt updatedAt"
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    id: user._id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profileImagePath: user.profileImagePath,
    permissions: user.permissions,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}


export async function adminDeleteUser(req: Request, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid user id", 400);

  // לא מאפשרים למחוק את עצמך (מומלץ)
  if (req.auth!.sub === id) throw new AppError("You cannot delete yourself", 400);

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new AppError("User not found", 404);

  res.json({ message: "User deleted successfully" });
}
