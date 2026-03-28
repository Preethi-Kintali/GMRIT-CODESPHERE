import User from "../models/User.js";
import Session from "../models/Session.js";
import Problem from "../models/Problem.js";
import { clerkClient } from "@clerk/express";

export const getAdminStats = async (req, res) => {
  try {
    const activeSessions = await Session.countDocuments({ status: "active" });
    const totalInterviewers = await User.countDocuments({ role: "interviewer" });
    
    // Count candidates created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const candidatesToday = await User.countDocuments({
      role: "candidate",
      createdAt: { $gte: startOfDay },
    });

    const publishedProblems = await Problem.countDocuments({ isPublished: true });

    // Feedback Analytics
    const totalHired = await Session.countDocuments({ "feedback.recommendation": "Hire" });
    const totalConsidered = await Session.countDocuments({ "feedback.recommendation": "Consider" });
    const totalRejected = await Session.countDocuments({ "feedback.recommendation": "Reject" });

    res.json({
      activeSessions,
      totalInterviewers,
      candidatesToday,
      publishedProblems,
      feedbackStats: { hired: totalHired, considered: totalConsidered, rejected: totalRejected }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getInterviewers = async (req, res) => {
  try {
    const interviewers = await User.find({ role: "interviewer" }).select("-clerkId");
    res.json(interviewers);
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCandidates = async (req, res) => {
  try {
    // We could return just candidates, but for testing or real world use admins
    // might want to interview ANY user (even other interviewers), but let's stick to candidates.
    const candidates = await User.find({ role: "candidate" }).select("-clerkId");
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const promoteToInterviewer = async (req, res) => {
  try {
    const { email, department, expertise } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email." });
    }

    // Update in MongoDB
    user.role = "interviewer";
    if (department) user.department = department;
    if (expertise) user.expertise = expertise;
    await user.save();

    // Update in Clerk Public Metadata
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        role: "interviewer",
      },
    });

    res.json({ message: "User promoted to interviewer successfully", user });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("interviewer", "name email profileImage")
      .populate("candidate", "name email profileImage")
      .populate("problem", "title difficulty")
      .sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (error) {
    console.error("Error fetching all sessions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
