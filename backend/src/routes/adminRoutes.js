import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { requireAdmin } from "../middleware/requireRole.js";
import { getAdminStats, getInterviewers, getCandidates, promoteToInterviewer, getAllSessions } from "../controllers/adminController.js";
import { getAdminProblems, createProblem, updateProblem } from "../controllers/problemController.js";

const router = express.Router();

router.use(protectRoute, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/sessions", getAllSessions);
router.get("/interviewers", getInterviewers);
router.get("/candidates", getCandidates);
router.post("/interviewers", promoteToInterviewer);

router.get("/problems", getAdminProblems);
router.post("/problems", createProblem);
router.put("/problems/:id", updateProblem);

export default router;
