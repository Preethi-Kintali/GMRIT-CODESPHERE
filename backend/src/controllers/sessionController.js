import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import crypto from "crypto";
import { inngest } from "../lib/inngest.js";
import { ENV } from "../lib/env.js";

export async function scheduleSession(req, res) {
  try {
    const { interviewer, candidate, problem, scheduledAt, duration, timezoneOffset } = req.body;

    if (!interviewer || !candidate || !problem || !scheduledAt || !duration) {
      return res.status(400).json({ message: "All scheduling fields are required" });
    }

    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + duration * 60000);
    const now = new Date();

    // 1. Check if the date is in the past
    if (start < now) {
      return res.status(400).json({ message: "Cannot schedule sessions in the past." });
    }

    // 2. Base Scheduling Rule Validations (Sundays, Bounds, and Lunch) purely in Client Timezone Context
    const offsetMs = (timezoneOffset || 0) * 60000;
    const localStartEpoch = start.getTime() - offsetMs;
    const localEndEpoch = end.getTime() - offsetMs;
    
    const localStartDate = new Date(localStartEpoch);
    const localEndDate = new Date(localEndEpoch);
    
    // Rule a: Sundays
    if (localStartDate.getUTCDay() === 0) {
       return res.status(400).json({ message: "Interviews cannot be scheduled on Sundays." });
    }

    // Rule b: 9:00 AM to 9:00 PM Operational Bounds
    const startTimeDecimal = localStartDate.getUTCHours() + localStartDate.getUTCMinutes() / 60;
    const endTimeDecimal = localEndDate.getUTCHours() + localEndDate.getUTCMinutes() / 60;
    
    // Note: If session crosses beyond midnight local time, it's also effectively beyond 9 PM or next day.
    if (startTimeDecimal < 9 || endTimeDecimal > 21 || localStartDate.getUTCDate() !== localEndDate.getUTCDate()) {
       return res.status(400).json({ message: "Sessions must be scheduled strictly within 9:00 AM and 9:00 PM." });
    }

    // Rule c: Lunch Time (1:00 PM - 2:30 PM) Overlap Protection
    if (startTimeDecimal < 14.5 && endTimeDecimal > 13) {
       return res.status(400).json({ message: "Interviews cannot overlap with the 1:00 PM to 2:30 PM lunch break." });
    }
    
    // 3. Check Daily Limits (Max 2 per day, one Morning & one Afternoon, 1.5hr Gap)
    const localStartOfDay = new Date(localStartEpoch);
    localStartOfDay.setUTCHours(0, 0, 0, 0); // Find pure UTC Midnight of this shifted representation
    const localEndOfDay = new Date(localStartEpoch);
    localEndOfDay.setUTCHours(23, 59, 59, 999);
    
    // Shift the determined midnight boundaries safely back to proper UTC absolute format for MongoDB querying
    const startOfDay = new Date(localStartOfDay.getTime() + offsetMs);
    const endOfDay = new Date(localEndOfDay.getTime() + offsetMs);

    const dailySessions = await Session.find({
      status: { $in: ["scheduled", "active"] },
      $or: [{ interviewer }, { candidate }],
      scheduledAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const interviewerSessions = dailySessions.filter(s => s.interviewer.toString() === interviewer || s.candidate.toString() === interviewer);
    const candidateSessions = dailySessions.filter(s => s.interviewer.toString() === candidate || s.candidate.toString() === candidate);

    const getLocalHour = (utcDateString) => {
       const epoch = new Date(utcDateString).getTime() - offsetMs;
       return new Date(epoch).getUTCHours();
    };

    const validateDailyLimit = (sessions, roleName) => {
      if (sessions.length >= 2) return `${roleName} already has a maximum of 2 interviews scheduled for this day.`;
      
      if (sessions.length === 1) {
        const existingSession = sessions[0];
        
        // Ensure 1.5 Hour Gap Validation (90 minutes = 5,400,000 ms)
        const MIN_GAP_MS = 90 * 60 * 1000;
        const existingStartTs = new Date(existingSession.scheduledAt).getTime();
        const existingEndTs = existingStartTs + (existingSession.duration * 60000);
        
        // Check if new session ends before existing gap triggers, OR starts after existing gap expires
        const isSafeBefore = (end.getTime() + MIN_GAP_MS) <= existingStartTs;
        const isSafeAfter = start.getTime() >= (existingEndTs + MIN_GAP_MS);
        
        if (!isSafeBefore && !isSafeAfter) {
           return `${roleName} must have at least a 1.5-hour gap between their two daily interviews.`;
        }

        const existingSessionHour = getLocalHour(existingSession.scheduledAt);
        const newSessionHour = getLocalHour(scheduledAt);
        
        const existingIsMorning = existingSessionHour < 12;
        const newIsMorning = newSessionHour < 12;
        
        if (existingIsMorning && newIsMorning) {
          return `${roleName} already has a morning interview on this day. The second interview must be scheduled in the afternoon (12:00 PM or later).`;
        }
        if (!existingIsMorning && !newIsMorning) {
          return `${roleName} already has an afternoon interview on this day. The second interview must be scheduled in the morning (before 12:00 PM).`;
        }
      }
      return null;
    };

    const interviewerError = validateDailyLimit(interviewerSessions, "Interviewer");
    if (interviewerError) return res.status(400).json({ message: interviewerError });

    const candidateError = validateDailyLimit(candidateSessions, "Candidate");
    if (candidateError) return res.status(400).json({ message: candidateError });

    // 4. Check for Overlapping Sessions (Interviewer or Candidate)
    const conflict = await Session.findOne({
      status: { $in: ["scheduled", "active"] },
      $or: [
        { interviewer },
        { candidate },
        { interviewer: candidate }, // Ensure they aren't interviewing themselves (safety)
      ],
      $or: [
        { scheduledAt: { $lt: end, $gte: start } }, // New session starts during an old one
        { $and: [
          { scheduledAt: { $lte: start } }, 
          { $expr: { $gt: [{ $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] }, start] } }
        ]} // Old session spans across the new start
      ]
    });

    if (conflict) {
      const actor = conflict.interviewer.toString() === interviewer ? "Interviewer" : "Candidate";
      return res.status(400).json({ message: `${actor} already has an active session during this time.` });
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

    // Offload Emails and Notifications to Inngest
    await inngest.send({
      name: "session/scheduled",
      data: {
        params: {
          interviewerEmail: interviewerDoc.email,
          interviewerName: interviewerDoc.name,
          candidateEmail: candidateDoc.email,
          candidateName: candidateDoc.name,
          problemTitle: problemDoc.title,
          scheduledAt: session.scheduledAt,
          duration: session.duration,
          interviewerLink,
          candidateLink,
        },
        notifications: [
          {
            userId: interviewerDoc._id,
            type: "session_scheduled",
            title: "New Interview Scheduled",
            message: `You have been scheduled to interview ${candidateDoc.name} for the problem "${problemDoc.title}".`,
            link: `/session/${session._id}`
          },
          {
            userId: candidateDoc._id,
            type: "session_scheduled",
            title: "Interview Scheduled",
            message: `Your interview with ${interviewerDoc.name} for the problem "${problemDoc.title}" has been scheduled.`,
            link: `/session/${session._id}`
          }
        ]
      }
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

    // V2.2: Strict Block on Non-Active/Scheduled States
    if (session.status === "completed") {
      return res.status(403).json({ message: "This interview has already been completed and cannot be rejoined." });
    }
    if (session.status === "cancelled") {
      return res.status(403).json({ message: "This interview session was cancelled by the administrator." });
    }

    let isInterviewer = false;
    let isCandidate = false;

    // 1. Check identity based on Session participants
    const sessionInterviewerId = session.interviewer.toString();
    const sessionCandidateId = session.candidate.toString();

    // 2. Resolve role based on Identity or Token
    if (sessionInterviewerId === userId && (!token || session.interviewerToken === token)) {
      if (!session.isInterviewerVerified) {
        return res.status(401).json({ 
          message: "Interviewer security verification required", 
          requiresVerification: true 
        });
      }
      isInterviewer = true;
    } else if (sessionCandidateId === userId && (!token || session.candidateToken === token)) {
      if (!session.isVerified) {
        return res.status(401).json({ 
          message: "Candidate security verification required", 
          requiresVerification: true 
        });
      }
      isCandidate = true;
    } else {
      // Fallback: If identity doesn't match, or if specifically trying to join with wrong token
      return res.status(403).json({ message: "Invalid access or unauthorized identity" });
    }

    // 3. Activation Guard (Only activate at or after start time)
    const now = new Date();
    const scheduledTime = new Date(session.scheduledAt);

    if (session.status === "scheduled" && now >= scheduledTime) {
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
    const { finalCode, finalLanguage } = req.body;
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
    if (finalCode) session.finalCode = finalCode;
    if (finalLanguage) session.finalLanguage = finalLanguage;
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

    // Notify Interviewer and Candidate via Email
    const interviewerDoc = await User.findById(session.interviewer);
    const candidateDoc = await User.findById(session.candidate);
    const problemDoc = await Problem.findById(session.problem);

    if (interviewerDoc && candidateDoc && problemDoc) {
      await inngest.send({
        name: "session/cancelled",
        data: {
          params: {
            interviewerEmail: interviewerDoc.email,
            interviewerName: interviewerDoc.name,
            candidateEmail: candidateDoc.email,
            candidateName: candidateDoc.name,
            problemTitle: problemDoc.title,
            scheduledAt: session.scheduledAt,
          },
          notifications: [
            {
              userId: interviewerDoc._id,
              type: "session_cancelled",
              title: "Interview Cancelled",
              message: `The interview with ${candidateDoc.name} for "${problemDoc.title}" has been cancelled.`
            },
            {
              userId: candidateDoc._id,
              type: "session_cancelled",
              title: "Interview Cancelled",
              message: `Your interview with ${interviewerDoc.name} for "${problemDoc.title}" has been cancelled.`
            }
          ]
        }
      });
    }

    res.status(200).json({ session, message: "Session cancelled successfully" });
  } catch (error) {
    console.error("Error in cancelSession:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendSessionOtp(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const session = await Session.findById(id).populate("candidate").populate("interviewer");
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isCandidate = session.candidate._id.toString() === userId;
    const isInterviewer = session.interviewer._id.toString() === userId;

    if (!isCandidate && !isInterviewer) {
      return res.status(403).json({ message: "Unauthorized OTP request" });
    }

    if ((isCandidate && session.isVerified) || (isInterviewer && session.isInterviewerVerified)) {
      return res.status(400).json({ message: "Account is already verified for this session" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    const targetUser = isCandidate ? session.candidate : session.interviewer;
    
    if (isCandidate) {
      session.candidateOtp = { code: otp, expiresAt };
    } else {
      session.interviewerOtp = { code: otp, expiresAt };
    }
    
    await session.save();

    // Offload via Inngest
    await inngest.send({
      name: "session/otp",
      data: {
        emailParams: {
          userEmail: targetUser.email,
          userName: targetUser.name,
          otpCode: otp
        },
        notificationParams: {
          userId: targetUser._id,
          type: "session_otp",
          title: "Your Identity Code",
          message: `Your verification code for the interview is ${otp}. It expires in 10 minutes.`,
        }
      }
    });

    res.status(200).json({ message: `Verification code sent to ${targetUser.email}` });
  } catch (error) {
    console.error("Error in sendSessionOtp:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifySessionOtp(req, res) {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const userId = req.user._id.toString();

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isCandidate = session.candidate.toString() === userId;
    const isInterviewer = session.interviewer.toString() === userId;

    if (!isCandidate && !isInterviewer) {
      return res.status(403).json({ message: "Unauthorized verification attempt" });
    }

    const otpData = isCandidate ? session.candidateOtp : session.interviewerOtp;

    if ((isCandidate && session.isVerified) || (isInterviewer && session.isInterviewerVerified)) {
      return res.status(200).json({ message: "Already verified" });
    }

    if (!otpData?.code || otpData.code !== otp) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > otpData.expiresAt) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    if (isCandidate) {
      session.isVerified = true;
      session.candidateOtp = undefined;
    } else {
      session.isInterviewerVerified = true;
      session.interviewerOtp = undefined;
    }
    
    await session.save();

    res.status(200).json({ message: "Verification successful!" });
  } catch (error) {
    console.error("Error in verifySessionOtp:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function submitCandidateFeedback(req, res) {
  try {
    const { id } = req.params;
    const { rating, notes } = req.body;
    const userId = req.user._id.toString();

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.candidate.toString() !== userId) {
      return res.status(403).json({ message: "Only the candidate can submit this feedback" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ message: "Feedback can only be submitted for completed sessions" });
    }

    if (session.candidateFeedback?.submittedAt) {
      return res.status(400).json({ message: "Feedback has already been submitted for this session" });
    }

    session.candidateFeedback = {
      rating,
      notes,
      submittedAt: new Date(),
    };

    await session.save();

    res.status(200).json({ message: "Thank you for your feedback!" });
  } catch (error) {
    console.error("Error in submitCandidateFeedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function recordViolation(req, res) {
  try {
    const { id } = req.params;
    const { type, message } = req.body;
    const userId = req.user._id.toString();

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.candidate.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    session.violationCount = (session.violationCount || 0) + 1;
    await session.save();

    // Notify interviewer via Notification
    await Notification.create({
      userId: session.interviewer,
      type: "violation_warning",
      title: "Security Violation Alert",
      message: `Candidate ${type}: ${message} (Total: ${session.violationCount})`,
    });

    res.status(200).json({ violationCount: session.violationCount });
  } catch (error) {
    console.error("Error in recordViolation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function terminateByViolation(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id.toString();

    const session = await Session.findById(id)
      .populate("interviewer", "name email")
      .populate("candidate", "name email");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Can be triggered by candidate (auto) or interviewer (manual)
    if (session.candidate._id.toString() !== userId && session.interviewer._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized termination" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ message: "Only active sessions can be terminated for violations" });
    }

    // Cleanup Stream
    try {
      const call = streamClient.video.call("default", session.callId);
      await call.delete({ hard: true });
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (e) {
      console.error("Stream cleanup failed during termination:", e.message);
    }

    session.status = "completed"; // status is completed but recorded as violation
    session.terminationReason = reason || "Security Policy Breach (3+ Fullscreen Violations)";
    await session.save();

    // Offload via Inngest
    await inngest.send({
      name: "session/terminated",
      data: {
        params: {
          interviewerEmail: session.interviewer.email,
          interviewerName: session.interviewer.name,
          candidateEmail: session.candidate.email,
          candidateName: session.candidate.name,
          reason: session.terminationReason
        },
        notifications: [
          {
            userId: session.interviewer._id,
            type: "session_terminated",
            title: "Session Terminated: Security",
            message: `The session with ${session.candidate.name} was terminated for: ${session.terminationReason}`
          },
          {
            userId: session.candidate._id,
            type: "session_terminated",
            title: "Policy Breach: Terminated",
            message: "Your interview was terminated due to security violations. A report has been sent to the admin."
          }
        ]
      }
    });

    res.status(200).json({ message: "Session terminated due to security violations", status: "terminated" });
  } catch (error) {
    console.error("Error in terminateByViolation:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function checkIn(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status === "completed" || session.status === "cancelled") {
      return res.status(400).json({ message: `Cannot check-in to a ${session.status} session` });
    }

    if (session.interviewer.toString() === userId) {
      session.interviewerCheckedIn = true;
      session.interviewerCheckedInAt = new Date();
    } else if (session.candidate.toString() === userId) {
      if (!session.isVerified) {
        return res.status(401).json({ message: "Candidate must be verified (OTP) before checking in" });
      }
      session.candidateCheckedIn = true;
      session.candidateCheckedInAt = new Date();
    } else {
      return res.status(403).json({ message: "Unauthorized check-in attempt" });
    }

    await session.save();
    res.status(200).json({ session, message: "Checked in successfully" });
  } catch (error) {
    console.error("Error in checkIn:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptGuidelines(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.interviewer.toString() === userId) {
      session.interviewerAcceptedGuidelines = true;
    } else if (session.candidate.toString() === userId) {
      session.candidateAcceptedGuidelines = true;
    } else {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await session.save();
    res.status(200).json({ message: "Guidelines accepted" });
  } catch (error) {
    console.error("Error in acceptGuidelines:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
