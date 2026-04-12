import cron from "node-cron";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import { streamClient, chatClient } from "../lib/stream.js";
import { sendInterviewInvite } from "../lib/email.js";
import { ENV } from "../lib/env.js";


// Run every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("Running scheduled job for interview reminders...");
  
  try {
    const now = new Date();
    const in60Mins = new Date(now.getTime() + 60 * 60 * 1000);
    const in75Mins = new Date(now.getTime() + 75 * 60 * 1000);

    // Find sessions scheduled between 60 and 75 minutes from now
    const upcomingSessions = await Session.find({
      status: "scheduled",
      scheduledAt: {
        $gte: in60Mins,
        $lt: in75Mins,
      },
    });

    if (upcomingSessions.length === 0) {
      return;
    }

    console.log(`Found ${upcomingSessions.length} upcoming sessions. Sending reminders...`);

    for (const session of upcomingSessions) {
      const interviewerDoc = await User.findById(session.interviewer);
      const candidateDoc = await User.findById(session.candidate);
      const problemDoc = await Problem.findById(session.problem);

      if (!interviewerDoc || !candidateDoc || !problemDoc) continue;

      const baseUrl = ENV.CLIENT_URL || "http://localhost:5173";
      const interviewerLink = `${baseUrl}/session/${session._id}?token=${session.interviewerToken}`;
      const candidateLink = `${baseUrl}/session/${session._id}?token=${session.candidateToken}`;

      // Re-using the sendInterviewInvite function for the reminder
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

      console.log(`Sent reminder for session ${session._id}`);
    }
  } catch (error) {
    console.error("Error in reminder cron job:", error);
  }
});

// Session Lifecycle Cleanup: Run every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log("Running scheduled job for session lifecycle cleanup...");
  
  try {
    const now = new Date();
    
    // Find sessions that have ended (Duration + 1 hour buffer for late starts)
    // We target 'active' or 'scheduled' sessions that should have finished.
    const expiredSessions = await Session.find({
      status: { $in: ["scheduled", "active"] },
      scheduledAt: { $lt: new Date(now.getTime() - (2 * 60 * 60 * 1000)) } // 2 hours ago
    });

    if (expiredSessions.length === 0) return;

    console.log(`Found ${expiredSessions.length} expired sessions. Processing cleanup...`);

    for (const session of expiredSessions) {
      try {
        // 1. Cleanup Stream Video
        const call = streamClient.video.call("default", session.callId);
        await call.delete({ hard: true }).catch(() => null);
        
        // 2. Cleanup Stream Chat
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete().catch(() => null);
        
        // 3. Mark as Auto-Completed
        session.status = "completed";
        session.autoCompleted = true;
        await session.save();
        
        console.log(`✅ Auto-completed expired session: ${session._id}`);
      } catch (err) {
        console.error(`Failed to cleanup session ${session._id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error in lifecycle cron job:", error);
  }
});

