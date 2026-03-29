import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getMyProfile, updateMyProfile } from "../controllers/userController.js";

const router = express.Router();

// Apply protectRoute middleware to secure all user endpoints
router.use(protectRoute);

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

export default router;
