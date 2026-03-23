import express from "express";
import { getFinancialReports } from "../controllers/reports.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Admin only
router.get("/financials", authMiddleware, roleMiddleware("admin"), getFinancialReports);

export default router;
