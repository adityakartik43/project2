import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Admin only
router.get("/stats", authMiddleware, roleMiddleware("admin"), getDashboardStats);

export default router;