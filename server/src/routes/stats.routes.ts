import { Router } from "express";
import { getDashboardStats } from "../controllers/stats.controller";
import { authenticateToken, authorizeRole } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, authorizeRole("admin"), getDashboardStats);

export default router;