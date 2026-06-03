const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
require("express-async-errors");

// Load env FIRST
dotenv.config();
const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);
const connectDB = require("./config/database");
const errorHandler = require("./utils/errorHandler");
const authRoutes = require("./routes/authRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/statistics", statisticsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.status(200).json({
    success: true,
    message: "Backend is running",
    database: {
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name || null,
    },
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Altas Dental Center Backend API",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("====================================");
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    console.error("====================================");
    process.exit(1);
  }
};

startServer();