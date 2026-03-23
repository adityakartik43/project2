import express from "express";
import { makePayment } from "../controllers/residentPayment.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Resident + admin can access
router.post("/pay", authMiddleware, roleMiddleware("resident"), makePayment);

export default router;
