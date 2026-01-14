import type { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { hashPassword, verifyPassword } from "../utils/password";
import { sendMail } from "../utils/mailer";

/* ===== HELPERS ===== */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError("JWT_SECRET is missing", 500);
  return secret;
}

function toUserResponse(user: any) {
  return {
    id: user._id,
    username: user.username,
    role: user.role,
    profileImagePath: user.profileImagePath,
    permissions: user.permissions, 
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
  };
}

// תיקון השגיאה ב-jwt.sign על ידי הגדרת Payload פשוט
function signToken(user: { id: string; username: string; role: string }) {
  const payload = { sub: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) ?? "1h",
  });
}

/* ===== AUTH OPERATIONS ===== */
export async function signup(req: Request, res: Response) {
  const { firstName, lastName, username, email, phone, password } = req.body;
  if (!firstName || !lastName || !username || !email || !phone || !password) {
    throw new AppError("Missing required fields", 400);
  }

  const normalizedEmail = String(email).toLowerCase();
  const exists = await User.findOne({ $or: [{ username }, { email: normalizedEmail }] });
  if (exists) throw new AppError("Username or email already exists", 409);

  const passwordHash = await hashPassword(password);
  const file = (req as any).file;
  const profileImagePath = file ? `/uploads/profiles/${file.filename}` : null;

  const user = await User.create({
    firstName, lastName, username, email: normalizedEmail,
    phone, profileImagePath, passwordHash, role: "USER"
  });

  res.status(201).json({ 
    token: signToken({ id: user._id.toString(), username: user.username, role: user.role }), 
    user: toUserResponse(user) 
  });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select("+passwordHash");
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError("Invalid credentials", 401);
  }

  res.json({ 
    token: signToken({ id: user._id.toString(), username: user.username, role: user.role }), 
    user: toUserResponse(user) 
  });
}

export async function me(req: Request, res: Response) {
  const auth = (req as any).auth; // תיקון הקו האדום מתחת ל-req.auth
  if (!auth) throw new AppError("Unauthorized", 401);
  
  const user = await User.findById(auth.sub);
  if (!user) throw new AppError("User not found", 401);
  res.json(toUserResponse(user));
}

/* ===== UPDATE USER (Admin Only) ===== */
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const updateData = { ...req.body };
  const auth = (req as any).auth; // פותר את השגיאה של TypeScript

  // בדיקה שהמשתמש הוא אדמין לפני שינוי הרשאות
  if ((updateData.role || updateData.permissions) && auth?.role !== "ADMIN") {
    throw new AppError("Forbidden: Only admins can change permissions", 403);
  }

  // בדיקה אם שם המשתמש החדש כבר קיים אצל מישהו אחר
  if (updateData.username) {
    const existingUser = await User.findOne({ 
      username: updateData.username, 
      _id: { $ne: id } 
    });
    if (existingUser) {
      throw new AppError("Username is already taken", 400);
    }
  }

  // העדכון ב-Database (כולל firstName, lastName, username)
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) throw new AppError("User not found", 404);

  res.json({ 
    message: "User updated successfully", 
    user: toUserResponse(updatedUser) 
  });
}
/* ===== PASSWORD RESET ===== */
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.json({ message: "If the email exists, a reset link was sent." });

  const token = crypto.randomBytes(32).toString("hex");
  user.passwordResetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  await sendMail(user.email, "Reset Password", `<p>Link: ${process.env.APP_URL}/reset-password?token=${token}</p>`);
  res.json({ message: "If the email exists, a reset link was sent." });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({ 
    passwordResetTokenHash: tokenHash, 
    passwordResetExpires: { $gt: new Date() } 
  });
  
  if (!user) throw new AppError("Invalid or expired token", 400);

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  await user.save();
  res.json({ message: "Password updated" });
}