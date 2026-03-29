import cron from "node-cron";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import { sendInterviewInvite } from "../lib/email.js"; // Reuse or create a new reminder email template
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
