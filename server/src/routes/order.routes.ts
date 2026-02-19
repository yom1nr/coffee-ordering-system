import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authenticateToken, authorizeRole, optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.schema";

const router = Router();

router.post("/", optionalAuthenticate, validate(createOrderSchema), createOrder);
router.get("/my-orders", authenticateToken, getMyOrders);
router.get("/", authenticateToken, authorizeRole("admin"), getAllOrders);
router.put("/:id/status", authenticateToken, authorizeRole("admin"), validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
