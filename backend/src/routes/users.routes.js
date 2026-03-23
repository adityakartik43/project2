import express from "express";
import { registerUser, loginUser, getDetails, getVacantFlats, editFlatOwner, googleCallback } from "../controllers/users.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import passport from "passport";

const router = express.Router();

// Public routes — no auth needed
router.post("/login", loginUser);
router.post("/register", registerUser);

// Google auth routes
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: true }),
  googleCallback
);

// Admin only — flat/user management
router.get("/get-details", authMiddleware, roleMiddleware("admin"), getDetails);
router.get("/get-vflats", authMiddleware, roleMiddleware("admin"), getVacantFlats);
router.put("/edit-owner", authMiddleware, roleMiddleware("admin"), editFlatOwner);

export default router;