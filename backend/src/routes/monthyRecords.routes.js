import express from "express";
import { getAllDetails } from "../controllers/monthyRecords.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Admin only
router.get("/card-values", authMiddleware, roleMiddleware("admin"), getAllDetails);

export default router;