import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../AppError";

const secret = process.env.JWT_SECRET ?? "";

export async function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const authCookie = req.headers.cookie?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith("auth_token="));
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authCookie?.slice("auth_token=".length);

  if (!token) {
    return next(new AppError("token missing", 401));
  }

  try {
    const response = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: "transport-management",
      audience: "transport-management-web",
    });

    if (typeof response === "string" || !("id" in response) ||
      typeof response.id !== "string" || !/^\d+$/.test(response.id) ||
      !Number.isSafeInteger(Number(response.id)) || Number(response.id) < 1) {
      return next(new AppError("invalid credentials", 401));
    } else {
      req.userId = response.id;
      next();
    }
  } catch (err) {
    return next(new AppError("invalid or expired token", 401));
  }
}
