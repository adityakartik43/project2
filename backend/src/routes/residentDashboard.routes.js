import express from "express";
import { residentDashboard } from "../controllers/residentDashboard.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Resident + admin can access
router.get("/stats/:user_id", authMiddleware, roleMiddleware("resident"), residentDashboard);

export default router;
