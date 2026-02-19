import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { authenticateToken, authorizeRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validators/product.schema";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", authenticateToken, authorizeRole("admin"), validate(createProductSchema), createProduct);
router.put("/:id", authenticateToken, authorizeRole("admin"), validate(updateProductSchema), updateProduct);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteProduct);

export default router;
