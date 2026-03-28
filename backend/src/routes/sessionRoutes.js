import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { requireAdmin } from "../middleware/requireRole.js";
import {
  scheduleSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  endSession,
  submitFeedback,
  cancelSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/schedule", protectRoute, requireAdmin, scheduleSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);
router.post("/:id/feedback", protectRoute, submitFeedback);
router.post("/:id/cancel", protectRoute, requireAdmin, cancelSession);

export default router;
