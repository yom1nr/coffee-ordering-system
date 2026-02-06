import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authenticateToken, authorizeRole, optionalAuthenticate } from "../middleware/auth";

const router = Router();

router.post("/", optionalAuthenticate, createOrder);
router.get("/my-orders", authenticateToken, getMyOrders);
router.get("/", authenticateToken, authorizeRole("admin"), getAllOrders);
router.put("/:id/status", authenticateToken, authorizeRole("admin"), updateOrderStatus);

export default router;
