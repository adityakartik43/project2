import express from "express";
import { getProfile, updateProfile } from "../controllers/profile.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Resident + admin can access (profile is personal — both roles need it)
router.get("/", authMiddleware, roleMiddleware("resident"), getProfile);
router.put("/", authMiddleware, roleMiddleware("resident"), updateProfile);

export default router;
