import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

type JwtPayload = {
  sub: string;
  username: string;
  role: "ADMIN" | "USER";
};

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing token", 401));
  }

  const token = header.slice("Bearer ".length);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.auth = decoded;
    next();
  } catch {
    next(new AppError("Invalid token", 401));
  }
}
