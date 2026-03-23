import express from 'express';
import { maintenance, getSubscriptions, updateFees } from '../controllers/subscriptions.controllers.js';
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = express.Router();

// Admin only
router.get('/get-subscriptions', authMiddleware, roleMiddleware("admin"), getSubscriptions);
router.post('/maintenance', authMiddleware, roleMiddleware("admin"), maintenance);
router.post('/set-maintenance', authMiddleware, roleMiddleware("admin"), updateFees);

export default router;