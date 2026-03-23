import express from "express";
import { getResidentBillingHistory, getSubscriptionDetail } from "../controllers/residentSubscriptions.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Resident + admin can access
router.get("/history/:user_id", authMiddleware, roleMiddleware("resident"), getResidentBillingHistory);
router.get("/detail/:user_id/:month_year", authMiddleware, roleMiddleware("resident"), getSubscriptionDetail);

export default router;
