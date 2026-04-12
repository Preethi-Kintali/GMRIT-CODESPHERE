import User from "../models/User.js";
import Session from "../models/Session.js";
import Problem from "../models/Problem.js";
import { clerkClient } from "@clerk/express";
import { inngest } from "../lib/inngest.js";

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

    // Offload via Inngest
    await inngest.send({
      name: "user/role-changed",
      data: {
        emailParams: {
          userEmail: user.email,
          userName: user.name,
          roleType: "Interviewer",
          action: "promoted"
        },
        notificationParams: {
          userId: user._id,
          type: "role_change",
          title: "Promoted to Interviewer",
          message: "Congratulations! You have been promoted to an Interviewer role."
        }
      }
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

export const demoteInterviewer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
       return res.status(400).json({ message: "Cannot demote an admin." });
    }

    // Update in MongoDB
    user.role = "candidate";
    user.department = undefined;
    user.expertise = [];
    await user.save();

    // Update in Clerk Public Metadata
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        role: "candidate",
      },
    });

    // Offload via Inngest
    await inngest.send({
      name: "user/role-changed",
      data: {
        emailParams: {
          userEmail: user.email,
          userName: user.name,
          roleType: "Candidate",
          action: "demoted"
        }
      }
    });

    res.json({ message: "Interviewer successfully moved back to candidate", user });
  } catch (error) {
    console.error("Error demoting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
