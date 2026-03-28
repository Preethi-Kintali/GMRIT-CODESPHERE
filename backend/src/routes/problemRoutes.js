import express from "express";
import { getPublishedProblems, getProblemBySlug } from "../controllers/problemController.js";

const router = express.Router();

// Public routes (though still need auth to be in dashboard)
router.get("/", getPublishedProblems);
router.get("/:slug", getProblemBySlug);

export default router;
