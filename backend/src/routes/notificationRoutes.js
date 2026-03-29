import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getMyNotifications, markAsRead } from "../controllers/notificationController.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getMyNotifications);
router.put("/:id/read", markAsRead);

export default router;
