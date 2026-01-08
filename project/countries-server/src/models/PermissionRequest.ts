import { Schema, model, type InferSchemaType } from "mongoose";

const permPatchSchema = new Schema(
  {
    countries: {
      read: { type: Boolean },
      create: { type: Boolean },
      update: { type: Boolean },
      delete: { type: Boolean },
    },
    cities: {
      read: { type: Boolean },
      create: { type: Boolean },
      update: { type: Boolean },
      delete: { type: Boolean },
    },
  },
  { _id: false }
);

const permissionRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requested: { type: permPatchSchema, required: true },
    message: { type: String, default: "" },

    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    decidedAt: { type: Date, default: null },

    isReadByAdmin: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export type PermissionRequestDoc = InferSchemaType<typeof permissionRequestSchema>;
export const PermissionRequest = model("PermissionRequest", permissionRequestSchema);
