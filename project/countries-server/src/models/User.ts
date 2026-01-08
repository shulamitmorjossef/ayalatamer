import { Schema, model, type InferSchemaType } from "mongoose";

type Crud = { read: boolean; create: boolean; update: boolean; delete: boolean };

const permissionsSchema = new Schema(
  {
    countries: {
      read: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    cities: {
      read: { type: Boolean, default: true },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2 },
    lastName: { type: String, required: true, trim: true, minlength: 2 },
    username: { type: String, required: true, trim: true, unique: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },



    // שומרים רק נתיב; הקובץ נשמר בתיקיית הפרויקט
    profileImagePath: { type: String, default: null },

    // לא להחזיר בברירות מחדל
    passwordHash: { type: String, required: true, select: false },

    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },

    permissions: { type: permissionsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
