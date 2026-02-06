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

// 👇 1. กำหนดรายชื่อเว็บที่อนุญาตให้เข้าใช้งาน (แก้ตรงนี้จุดเดียว)
const allowedOrigins = [
  "http://localhost:5173",                       // เครื่องเราเอง
  "https://coffee-ordering-system-nine.vercel.app", // เว็บ Vercel ของคุณ (เอามาจาก Error Log)
  "https://coffee-ordering-system.vercel.app"       // เผื่อไว้
];

// 👇 2. ตั้งค่า CORS ของ Socket.IO (Real-time)
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // ใช้รายชื่อจากข้างบน
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,      // สำคัญมาก! ต้องเปิด
  },
});

// 👇 3. ตั้งค่า CORS ของ Express (API ปกติ)
app.use(cors({
  origin: allowedOrigins, // ใช้รายชื่อจากข้างบน
  credentials: true,      // สำคัญมาก! ต้องเปิด
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
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();

export { app, io };