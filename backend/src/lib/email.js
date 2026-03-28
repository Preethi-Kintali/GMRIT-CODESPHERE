import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const sendInterviewInvite = async ({
  interviewerEmail,
  interviewerName,
  candidateEmail,
  candidateName,
  problemTitle,
  scheduledAt,
  duration,
  interviewerLink,
  candidateLink,
}) => {
  if (!ENV.GMAIL_USER || !ENV.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not set. Skipping real email send, but logging output:");
    console.log("-------------------");
    console.log(`To Interviewer (${interviewerEmail}): You have an interview with ${candidateName} at ${scheduledAt}. Link: ${interviewerLink}`);
    console.log(`To Candidate (${candidateEmail}): You have an interview at ${scheduledAt}. Link: ${candidateLink}`);
    console.log("-------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ENV.GMAIL_USER,
      pass: ENV.GMAIL_APP_PASSWORD,
    },
  });

  const formattedDate = new Date(scheduledAt).toLocaleString();

  try {
    // Send to Candidate
    await transporter.sendMail({
      from: `"CodeSphere" <${ENV.GMAIL_USER}>`,
      to: candidateEmail,
      subject: "Your Technical Interview Invitation - GMRIT CodeSphere",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Interview Invitation</h2>
          <p>Hi ${candidateName},</p>
          <p>You have been scheduled for a technical interview on CodeSphere.</p>
          <ul>
            <li><strong>Date & Time:</strong> ${formattedDate}</li>
            <li><strong>Duration:</strong> ${duration} minutes</li>
          </ul>
          <p>Please click the link below to join your session at the scheduled time:</p>
          <a href="${candidateLink}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Join Session</a>
          <p>Best of luck!</p>
        </div>
      `,
    });

    // Send to Interviewer
    await transporter.sendMail({
      from: `"CodeSphere" <${ENV.GMAIL_USER}>`,
      to: interviewerEmail,
      subject: "New Interview Assignment - GMRIT CodeSphere",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Interview Assignment</h2>
          <p>Hi ${interviewerName},</p>
          <p>You have been assigned to conduct a technical interview.</p>
          <ul>
            <li><strong>Candidate:</strong> ${candidateName}</li>
            <li><strong>Problem Assigned:</strong> ${problemTitle}</li>
            <li><strong>Date & Time:</strong> ${formattedDate}</li>
          </ul>
          <p>Please join the session 5 minutes early using your unique link:</p>
          <a href="${interviewerLink}" style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">Host Session</a>
        </div>
      `,
    });

    console.log("Emails sent successfully via Gmail!");
  } catch (error) {
    console.error("Failed to send emails via Nodemailer:", error);
  }
};
