import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "coffee_shop_jwt_secret_key_change_in_production";

// 🔒 1. แบบเข้มงวด (ต้องล็อกอินเท่านั้น) - ใช้กับหน้าดูประวัติ, ดูโปรไฟล์
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
    return;
  }
}

// 🔓 2. แบบใจดี (ล็อกอินก็ได้ ไม่ล็อกอินก็ได้) - ✅ เพิ่มอันนี้สำหรับ Guest Checkout
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  // ถ้าไม่มี Token ก็ปล่อยผ่านไปเลย (req.user จะเป็น undefined ซึ่งเราไปดักต่อใน controller เอา)
  if (!token) {
    next(); 
    return;
  }

  // ถ้ามี Token ก็ลองเช็คดู
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // ถ้าถูก ก็แปะป้ายชื่อ User ให้
    next();
  } catch (error) {
    // ถ้า Token ผิด ก็ปล่อยผ่านไปแบบ Guest (ไม่ error)
    next();
  }
}

// 👮 3. ตรวจสอบยศ (Admin only)
export function authorizeRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as jwt.JwtPayload | undefined;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden. Insufficient permissions." });
      return;
    }

    next();
  };
}