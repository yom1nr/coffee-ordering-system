import { Router } from "express";
import { getDashboardStats } from "../controllers/stats.controller";
import { authenticateToken, authorizeRole } from "../middleware/auth";

const router = Router();

// ให้สิทธิ์เฉพาะ Admin เท่านั้นถึงดูยอดขายได้
router.get("/", authenticateToken, authorizeRole("admin"), getDashboardStats);

export default router;