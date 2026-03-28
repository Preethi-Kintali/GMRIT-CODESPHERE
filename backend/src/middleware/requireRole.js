import { clerkClient } from "@clerk/express";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Error in requireAdmin middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const requireInterviewer = async (req, res, next) => {
  try {
    if (!req.user || !["admin", "interviewer"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - Interviewer access required" });
    }
    next();
  } catch (error) {
    console.error("Error in requireInterviewer middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
