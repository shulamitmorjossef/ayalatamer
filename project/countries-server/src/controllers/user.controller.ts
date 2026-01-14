import type { Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

// פונקציית עזר להחזרת משתמש בפורמט נקי
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

// 1. פרופיל שלי
export async function getMyProfile(req: Request, res: Response) {
  const auth = (req as any).auth;
  const user = await User.findById(auth.sub);
  if (!user) throw new AppError("User not found", 404);
  res.json(toUserResponse(user));
}

// 2. עדכון פרופיל שלי
export async function updateMyProfile(req: Request, res: Response) {
  const auth = (req as any).auth;
  const updateData = req.body;

  // מניעת שינוי תפקיד/הרשאות על ידי המשתמש עצמו
  delete updateData.role;
  delete updateData.permissions;

  if ((req as any).file) {
    updateData.profileImagePath = `/uploads/profiles/${(req as any).file.filename}`;
  }

  const updated = await User.findByIdAndUpdate(auth.sub, { $set: updateData }, { new: true });
  res.json({ message: "Profile updated", user: toUserResponse(updated) });
}

// 3. רשימת משתמשים (עבור אדמין)
export async function adminListUsers(_req: Request, res: Response) {
  const users = await User.find();
  res.json(users.map(toUserResponse));
}

// פונקציה לעדכון משתמש על ידי מנהל
export async function adminUpdateUser(req: Request, res: Response) {
  const { id } = req.params;
  const updateData = { ...req.body }; // מקבל את כל השדות מהפרונט (username, lastName, וכו')
  const auth = (req as any).auth;

  // הגנה: וודוא שהמבצע הוא אכן אדמין (ליתר ביטחון)
  if (auth?.role !== "ADMIN") {
    throw new AppError("Forbidden: Admin only", 403);
  }

  // בדיקה אם שם המשתמש החדש תפוס על ידי מישהו אחר
  if (updateData.username) {
    const existingUser = await User.findOne({ 
      username: updateData.username, 
      _id: { $ne: id } 
    });
    if (existingUser) {
      throw new AppError("שם המשתמש כבר תפוס במערכת", 400);
    }
  }

  // אם הועלתה תמונה חדשה דרך multer
  if ((req as any).file) {
    updateData.profileImagePath = `/uploads/profiles/${(req as any).file.filename}`;
  }

  // העדכון בפועל ב-Database
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedUser) throw new AppError("User not found", 404);

  res.json({ 
    message: "המשתמש עודכן בהצלחה", 
    user: toUserResponse(updatedUser) 
  });
}

// 5. מחיקת משתמש
export async function adminDeleteUser(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new AppError("User not found", 404);
  res.json({ message: "User deleted successfully" });
}