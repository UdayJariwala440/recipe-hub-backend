import express from "express";

import corsMiddleware from "./config/cors.js";
import securityMiddleware from "./config/security.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

// Security middleware
app.use(securityMiddleware);

// CORS
app.use(corsMiddleware);

// Parse JSON request body
app.use(express.json({ limit: "1mb" }));

// API routes
app.use("/api/v1", routes);

// Global error handler
app.use(errorMiddleware);

export default app;