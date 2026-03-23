import express from "express";
import { makePayment, recentEntries, residentData } from "../controllers/payments.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Admin only — enter payment on behalf of a resident, view recent entries
router.post("/make-payment", authMiddleware, roleMiddleware("admin"), makePayment);
router.get("/recents", authMiddleware, roleMiddleware("admin"), recentEntries);

// Resident data lookup — resident & admin can access
router.get("/resident/:flatNo", authMiddleware, roleMiddleware("resident"), residentData);

export default router;