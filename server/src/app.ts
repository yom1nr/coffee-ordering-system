import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import logger from "./config/logger";
import { requestIdMiddleware } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { TooManyRequestsError } from "./utils/AppError";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import statsRoutes from "./routes/stats.routes";

dotenv.config();

const app = express();

// ──── Security & Performance ────
app.use(helmet());
app.use(compression());

// ──── Request ID Tracking ────
app.use(requestIdMiddleware);

// ──── CORS ────
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : [
    "http://localhost:5173",
    "https://coffee-ordering-system-nine.vercel.app",
    "https://coffee-ordering-system.vercel.app",
  ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ──── Body Parsing ────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ──── Rate Limiting (Auth routes) ────
const authLimiter = createRateLimiter(15 * 60 * 1000, 20);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ──── Request Logging ────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.headers["x-request-id"],
    ip: req.ip,
  });
  next();
});

// ──── Health Check ────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "coffee-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ──── Routes ────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);

// ──── Global Error Handler (must be LAST middleware) ────
app.use(errorHandler);

// ──── Server Startup ────
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`, {
      env: process.env.NODE_ENV || "development",
    });
  });

  // ──── Graceful Shutdown ────
  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info("Server closed.");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown due to timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

// ──── Rate Limiter ────
function createRateLimiter(windowMs: number, maxRequests: number) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = requests.get(ip);

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      throw new TooManyRequestsError();
    }

    record.count++;
    next();
  };
}

startServer();

export { app };