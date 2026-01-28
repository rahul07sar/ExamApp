/**
 * Authentication & authorization middleware.
 * Verifies JWT from HTTP-only cookie.
 */
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface AuthPayload {
  sub: string;
  role: "admin" | "student";
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.auth;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthPayload;

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(role: "admin" | "student") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
