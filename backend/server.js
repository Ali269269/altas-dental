const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
require("express-async-errors");

// Load env FIRST
dotenv.config();

const { validateSecurityConfig } = require("./config/security");
validateSecurityConfig();

const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);
const connectDB = require("./config/database");
const errorHandler = require("./utils/errorHandler");
const { verifySmtpConnection } = require("./utils/emailService");
const { seedSystemEmailTemplates } = require("./utils/seedSystemEmailTemplates");
const { ensureRbacSeed } = require("./utils/ensureRbacSeed");
const authRoutes = require("./routes/authRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const blogRoutes = require("./routes/blogRoutes");
const subscribersRoutes = require("./routes/subscribersRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const specialityRoutes = require("./routes/specialityRoutes");
const adminManagementRoutes = require("./routes/adminManagementRoutes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Middleware
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

// CORS
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        if (isProduction) {
          callback(new Error("CORS blocked: origin header required"));
          return;
        }
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Public static assets (non-PHI only). Clinical scans require signed download tokens.
app.use(
  "/uploads/blogs",
  express.static(path.join(__dirname, "uploads", "blogs"), {
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

app.use(
  "/uploads/profiles",
  express.static(path.join(__dirname, "uploads", "profiles"), {
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

app.use(
  "/uploads/specialities",
  express.static(path.join(__dirname, "uploads", "specialities"), {
    setHeaders(res) {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/subscribers", subscribersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/admin-management", adminManagementRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, ok: true });
});

// Root route
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Altas Dental Center Backend API",
  });
});

// 404 handler
app.use((_req, res) => {
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
    await ensureRbacSeed();
    await seedSystemEmailTemplates();
    await verifySmtpConnection();
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
