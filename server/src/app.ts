import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import statsRoutes from "./routes/stats.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// 👇 1. กำหนด Allowed Origins (ใช้ .filter(Boolean) เพื่อกรองค่าว่างออก ไม่ให้ Error)
const allowedOrigins = [
  "http://localhost:5173",
  "https://coffee-ordering-system-nine.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

// 👇 2. ตั้งค่า CORS สำหรับ Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 👇 3. ตั้งค่า CORS สำหรับ Express API
app.use(cors({
  origin: (origin, callback) => {
    // อนุญาตถ้าไม่มี origin (เช่น server-to-server) หรือ origin ตรงกับในรายการ
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Coffee Shop API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();

export { app, io };