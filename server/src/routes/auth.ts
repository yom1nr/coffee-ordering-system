import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validators/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/profile", authenticateToken, getProfile);

export default router;
