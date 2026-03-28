import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import crypto from "crypto";
import { sendInterviewInvite } from "../lib/email.js";
import { ENV } from "../lib/env.js";

export async function scheduleSession(req, res) {
  try {
    const { interviewer, candidate, problem, scheduledAt, duration } = req.body;

    if (!interviewer || !candidate || !problem || !scheduledAt || !duration) {
      return res.status(400).json({ message: "All scheduling fields are required" });
    }

    const interviewerToken = crypto.randomBytes(16).toString("hex");
    const candidateToken = crypto.randomBytes(16).toString("hex");
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const session = await Session.create({
      interviewer,
      candidate,
      problem,
      scheduledAt,
      duration,
      callId,
      status: "scheduled",
      interviewerToken,
      candidateToken,
    });

    // Fetch details for email
    const interviewerDoc = await User.findById(interviewer);
    const candidateDoc = await User.findById(candidate);
    const problemDoc = await Problem.findById(problem);

    const baseUrl = ENV.CLIENT_URL || "http://localhost:5173";
    const interviewerLink = `${baseUrl}/session/${session._id}?token=${interviewerToken}`;
    const candidateLink = `${baseUrl}/session/${session._id}?token=${candidateToken}`;

    // Trigger Email sends via Resend
    await sendInterviewInvite({
      interviewerEmail: interviewerDoc.email,
      interviewerName: interviewerDoc.name,
      candidateEmail: candidateDoc.email,
      candidateName: candidateDoc.name,
      problemTitle: problemDoc.title,
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      interviewerLink,
      candidateLink,
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error("Error in scheduleSession:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;

    // Active or Scheduled sessions for this user depending on role
    const sessions = await Session.find({
      status: { $in: ["scheduled", "active"] },
      $or: [{ interviewer: userId }, { candidate: userId }],
    })
      .populate("interviewer", "name profileImage email clerkId")
      .populate("candidate", "name profileImage email clerkId")
      .populate("problem", "title difficulty")
      .sort({ scheduledAt: 1 });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getActiveSessions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;
    const sessions = await Session.find({
      status: "completed",
      $or: [{ interviewer: userId }, { candidate: userId }],
    })
      .populate("problem", "title difficulty")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error in getMyRecentSessions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate("interviewer", "name email profileImage clerkId")
      .populate("candidate", "name email profileImage clerkId")
      .populate("problem");

    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ session });
  } catch (error) {
    console.error("Error in getSessionById:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const { token } = req.query; // token from email link
    const userId = req.user._id.toString();
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({ message: `Cannot join a ${session.status} session` });
    }

    let isInterviewer = false;
    let isCandidate = false;

    // Validate the token and identity
    if (session.interviewer.toString() === userId && session.interviewerToken === token) {
      isInterviewer = true;
    } else if (session.candidate.toString() === userId && session.candidateToken === token) {
      isCandidate = true;
    } else {
      return res.status(403).json({ message: "Invalid token or unauthorized execution" });
    }

    // Activate the session if it's the first person joining at scheduled time
    if (session.status === "scheduled") {
      session.status = "active";
      await session.save();
    }

    // Add user to the Stream chat channel
    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session, role: isInterviewer ? "interviewer" : "candidate" });
  } catch (error) {
    console.error("Error in joinSession:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only interviewer can explicitly end the session
    if (session.interviewer.toString() !== userId) {
      return res.status(403).json({ message: "Only the interviewer can end the session directly" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    try {
      const call = streamClient.video.call("default", session.callId);
      await call.delete({ hard: true });
    } catch (e) {
      console.error("Could not delete Stream video:", e.message);
    }
    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (e) {
      console.error("Could not delete Stream chat:", e.message);
    }

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.error("Error in endSession:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function submitFeedback(req, res) {
  try {
    const { id } = req.params;
    const { rating, notes, recommendation } = req.body;
    const userId = req.user._id.toString();

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only interviewer can submit feedback
    if (session.interviewer.toString() !== userId) {
      return res.status(403).json({ message: "Only the interviewer can submit feedback" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "Session is not completed yet" });
    }

    session.feedback = {
      rating,
      notes,
      recommendation,
    };

    await session.save();
    res.status(200).json({ session, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function cancelSession(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({ message: `Cannot cancel a ${session.status} session` });
    }

    try {
      const call = streamClient.video.call("default", session.callId);
      await call.delete({ hard: true });
    } catch (e) {
      console.error("Could not delete Stream video:", e.message);
    }
    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (e) {
      console.error("Could not delete Stream chat:", e.message);
    }

    session.status = "cancelled";
    await session.save();

    // Optionally: trigger Resend email to Candidate and Interviewer here

    res.status(200).json({ session, message: "Session cancelled successfully" });
  } catch (error) {
    console.error("Error in cancelSession:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
