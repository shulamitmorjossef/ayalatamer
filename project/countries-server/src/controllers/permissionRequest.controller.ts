import type { Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";
import { PermissionRequest } from "../models/PermissionRequest";
import { User } from "../models/User";

function requireAuth(req: Request) {
  if (!req.auth) throw new AppError("Unauthorized", 401);
}

function requireAdmin(req: Request) {
  requireAuth(req);
  if (req.auth!.role !== "ADMIN") throw new AppError("Forbidden", 403);
}

/* ===== USER: create request ===== */
export async function createPermissionRequest(req: Request, res: Response) {
  requireAuth(req);

  const { requested, message } = req.body as { requested: any; message?: string };
  if (!requested) throw new AppError("Missing requested permissions", 400);

  const doc = await PermissionRequest.create({
    userId: req.auth!.sub,
    requested,
    message: message ?? "",
    status: "PENDING",
    isReadByAdmin: false,
  });

  res.status(201).json(doc);
}

/* ===== USER: my requests history ===== */
export async function myPermissionRequests(req: Request, res: Response) {
  requireAuth(req);

  const items = await PermissionRequest.find({ userId: req.auth!.sub })
    .sort({ createdAt: -1 });

  res.json(items);
}

export async function adminListPending(req: Request, res: Response) {
  requireAdmin(req);

  const items = await PermissionRequest.find({ status: "PENDING" })
    .sort({ createdAt: -1 })
    .populate("userId", "username firstName lastName role");

  res.json(items);
}



/* ===== ADMIN: mark as read ===== */
export async function adminMarkRead(req: Request, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid request id", 400);

  const updated = await PermissionRequest.findByIdAndUpdate(
    id,
    { isReadByAdmin: true },
    { new: true }
  );

  if (!updated) throw new AppError("Request not found", 404);
  res.json(updated);
}

/* ===== ADMIN: decide approve/reject ===== */
export async function adminDecide(req: Request, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError("Invalid request id", 400);

  const { decision } = req.body as { decision: "APPROVED" | "REJECTED" };
  if (!decision || (decision !== "APPROVED" && decision !== "REJECTED")) {
    throw new AppError("Invalid decision", 400);
  }

  const reqDoc = await PermissionRequest.findById(id);
  if (!reqDoc) throw new AppError("Request not found", 404);
  if (reqDoc.status !== "PENDING") throw new AppError("Request already decided", 409);

  // אם מאשרים → לעדכן הרשאות משתמש (merge true)
  if (decision === "APPROVED") {
    const user = await User.findById(reqDoc.userId);
    if (!user) throw new AppError("User not found", 404);

    const cur: any = user.permissions ?? {};
    const asked: any = reqDoc.requested ?? {};

    // merge: רק true שדולק בבקשה יהפוך ל-true אצל המשתמש
    for (const resource of ["countries", "cities"] as const) {
      cur[resource] = cur[resource] ?? {};
      asked[resource] = asked[resource] ?? {};
      for (const action of ["read", "create", "update", "delete"] as const) {
        if (asked[resource][action] === true) cur[resource][action] = true;
      }
    }

    user.permissions = cur;
    await user.save();
  }

  reqDoc.status = decision;
  reqDoc.decidedBy = new mongoose.Types.ObjectId(req.auth!.sub);
  reqDoc.decidedAt = new Date();
  reqDoc.isReadByAdmin = true;
  await reqDoc.save();

  res.json(reqDoc);
}
