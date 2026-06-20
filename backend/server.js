// File: backend/server.js

// ============================================
// IMPORTS — bring in all the tools we need
// ============================================

// dotenv MUST be the very first import
// It loads our .env file so all other code can access process.env variables
require("dotenv").config();

// Express is the framework that makes building servers easy
const express = require("express");

// cors allows our React frontend (running on port 3000)
// to communicate with this backend (running on port 5000)
// Without cors, the browser would block these requests for security reasons
const cors = require("cors");

// Import our database connection function
const connectDB = require("./config/db");

// Import our error handler middleware
const errorHandler = require("./middleware/errorHandler");
// Import Models (so they register with Mongoose)
require("./models/User");
require("./models/Product");
require("./models/Cart");
require("./models/Order");
// ============================================
// INITIALIZE
// ============================================

// Create the Express application
// 'app' is our server object - we use it for everything
const app = express();

// Connect to MongoDB
// We call this immediately when server starts
connectDB();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS - allows frontend to talk to backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// express.json() lets our server understand JSON data
// When frontend sends data (like login form), it comes as JSON
// Without this, req.body would be undefined
app.use(express.json());

// express.urlencoded() lets server understand form data
// extended: true allows complex objects in form data
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================
// Auth Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

// Cart Routes
const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

// Order Routes
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes);
// Test route - to verify server is running
// When someone visits http://localhost:5000/
// they get this response
app.get("/", (req, res) => {
  res.json({
    message: "🚀 NexCart API is running!",
    version: "1.0.0",
    status: "active",
  });
});

// We will add more routes here in later phases:
// app.use('/api/auth', authRoutes);      → Phase 4
// app.use('/api/products', productRoutes); → Phase 6
// app.use('/api/cart', cartRoutes);       → Phase 7
// app.use('/api/orders', orderRoutes);    → Phase 8

// ============================================
// ERROR HANDLER
// ============================================

// This MUST be the last middleware
// It catches any error that happens in any route above
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

// Read PORT from .env file, or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start listening for requests on the PORT
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
});
