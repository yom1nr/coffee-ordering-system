import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import statsRoutes from "./routes/stats.routes";

dotenv.config();

const app = express();

// Allowed origins (configurable via env, comma-separated)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : [
    "http://localhost:5173",
    "https://coffee-ordering-system-nine.vercel.app",
    "https://coffee-ordering-system.vercel.app",
  ];

// CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth routes (prevent brute force)
const authLimiter = createRateLimiter(15 * 60 * 1000, 20); // 20 requests per 15 min
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Coffee Shop API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Simple rate limiter (no external dependency needed)
function createRateLimiter(windowMs: number, maxRequests: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({ message: "Too many requests. Please try again later." });
      return;
    }

    record.count++;
    next();
  };
}

startServer();

export { app };