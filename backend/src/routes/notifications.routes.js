import express from "express";
import {
  sendNotifications,
  getNotifications,
  getResidentNotifications,
  markAsRead,
  getHasUnread
} from "../controllers/notifications.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Admin only — send & view all broadcasts
router.post(
  "/send",
  authMiddleware,
  roleMiddleware("admin"),
  sendNotifications,
);
router.get("/", authMiddleware, roleMiddleware("admin"), getNotifications);

// Resident + admin — view notifications on resident side
router.get(
  "/resident",
  authMiddleware,
  roleMiddleware("resident"),
  getResidentNotifications,
);
router.get("/has-unread", authMiddleware, roleMiddleware("resident"), getHasUnread);
router.put("/:id/read", authMiddleware, roleMiddleware("resident"), markAsRead);

export default router;
