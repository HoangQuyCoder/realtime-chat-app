import "dotenv/config";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import { pubClient, subClient, redis } from "./config/redis.js";
import { socketAuth } from "./middleware/auth.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { registerSocketHandlers, getOnlineUsers } from "./socket/handlers.js";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import userRoutes from "./routes/users.js";

const app = express();
const httpServer = createServer(app);

// ── Global Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" },
  }),
);

// ── REST API Routes ────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", async (req, res) => {
  const onlineIds = await getOnlineUsers();
  res.json({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    onlineUsers: onlineIds.length,
    timestamp: new Date().toISOString(),
  });
});

// ── Error Handling ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Socket.io Setup ────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
});

try {
  await Promise.all([
    pubClient.connect(),
    subClient.connect(),
    redis.connect(),
  ]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log("⚡ Redis Pub/Sub adapter initialized");
} catch (error) {
  console.error(
    "⚠️ Redis connection failed. Socket.io will run without Redis adapter (scaling disabled).",
  );
}

io.use(socketAuth);
registerSocketHandlers(io);

// ── Start ──────────────────────────────────────────────────
await connectDB();
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
  );
  console.log(`📡 WebSocket ready | 🗃  MongoDB | ⚡ Redis Pub/Sub`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} — shutting down`);
  await Promise.all([redis.quit(), pubClient.quit(), subClient.quit()]);
  httpServer.close(() => process.exit(0));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
