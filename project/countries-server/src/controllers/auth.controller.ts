// file: src/controllers/auth.controller.ts
import type { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";

import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { hashPassword, verifyPassword } from "../utils/password";
import { sendMail } from "../utils/mailer";

/* ===== JWT HELPERS ===== */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError("JWT_SECRET is missing", 500);
  return secret;
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "1h";

function signToken(user: { id: string; username: string; role: "ADMIN" | "USER" }) {
  const payload: jwt.JwtPayload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function toUserResponse(user: any) {
  return {
    id: user._id,
    username: user.username,
    role: user.role,
    profileImagePath: user.profileImagePath,
    permissions: user.permissions, // ✅ חשוב! כדי שה-UI יתעדכן
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
  };
}

/* ===== AUTH ===== */
export async function signup(req: Request, res: Response) {
  const { firstName, lastName, username, email, phone, password } = req.body as {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  if (!firstName || !lastName || !username || !email || !phone || !password) {
    throw new AppError("Missing required fields", 400);
  }

  if (String(password).length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const normalizedEmail = String(email).toLowerCase();

  const exists = await User.findOne({
    $or: [{ username }, { email: normalizedEmail }],
  });

  if (exists) {
    throw new AppError("Username or email already exists", 409);
  }

  const passwordHash = await hashPassword(password);

  // תמונה (multer)
  const file = (req as any).file as { filename: string } | undefined;
  const uploadsDir = process.env.UPLOADS_DIR ?? "uploads";
  const profileImagePath = file ? `/${uploadsDir}/profiles/${file.filename}` : null;

  const user = await User.create({
    firstName,
    lastName,
    username,
    email: normalizedEmail,
    phone,
    profileImagePath,
    passwordHash,
    role: "USER",
  });

  const token = signToken({
    id: user._id.toString(),
    username: user.username,
    role: user.role,
  });

  res.status(201).json({
    token,
    user: toUserResponse(user), // ✅ כולל permissions
  });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    throw new AppError("Missing credentials", 400);
  }

  const user = await User.findOne({ username }).select("+passwordHash");
  if (!user) throw new AppError("Invalid username or password", 401);

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) throw new AppError("Invalid username or password", 401);

  const token = signToken({
    id: user._id.toString(),
    username: user.username,
    role: user.role,
  });

  res.json({
    token,
    user: toUserResponse(user), // ✅ כולל permissions
  });
}

export async function me(req: Request, res: Response) {
  if (!req.auth) throw new AppError("Unauthorized", 401);

  const user = await User.findById(req.auth.sub);
  if (!user) throw new AppError("User not found", 401);

  res.json(toUserResponse(user));
}

/* ===== PASSWORD RESET ===== */
function getAppUrl(): string {
  return process.env.APP_URL ?? "http://localhost:5173";
}

function makeResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) throw new AppError("Email is required", 400);

  const normalizedEmail = String(email).toLowerCase();

  // לא לחשוף אם קיים/לא קיים
  const genericMsg = { message: "If the email exists, a reset link was sent." };

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordResetTokenHash +passwordResetExpires"
  );

  if (!user) return res.json(genericMsg);

  const { token, tokenHash } = makeResetToken();

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 דקות
  await user.save();

  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;

  await sendMail(
    user.email,
    "Reset your password",
    `<p>Click to reset password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  );

  res.json(genericMsg);
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };

  if (!token || !newPassword) throw new AppError("Missing token or password", 400);
  if (String(newPassword).length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpires +passwordHash");

  if (!user) throw new AppError("Invalid or expired token", 400);

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  await user.save();

  res.json({ message: "Password updated successfully" });
}
