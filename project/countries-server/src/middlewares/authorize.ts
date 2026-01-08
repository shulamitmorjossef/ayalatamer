import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";

type Action = "read" | "create" | "update" | "delete";
type Resource = "countries" | "cities";

export function requirePermission(resource: Resource, action: Action) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth) return next(new AppError("Unauthorized", 401));

      // Admin bypass
      if (req.auth.role === "ADMIN") return next();

      const user = await User.findById(req.auth.sub).select("permissions");
      if (!user) return next(new AppError("Unauthorized", 401));

      const allowed = (user.permissions as any)?.[resource]?.[action] === true;
      if (!allowed) return next(new AppError("Forbidden", 403));

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
