import { sendInterviewInvite } from "../lib/email.js";
import dotenv from "dotenv";

dotenv.config();

async function checkAfterHardening() {
    console.log("Checking Email with ENV hardening...");
    console.log("USER:", process.env.GMAIL_USER);
    
    try {
        const result = await sendInterviewInvite({
            interviewerEmail: "dineshjammu143@gmail.com",
            interviewerName: "Hardened Test",
            candidateEmail: "dineshjammu143@gmail.com",
            candidateName: "Hardened Test",
            problemTitle: "Env Hardening Check",
            scheduledAt: new Date(),
            duration: 30,
            interviewerLink: "http://test.com",
            candidateLink: "http://test.com"
        });
        console.log("Result:", result);
    } catch (e) {
        console.error("Test Error:", e);
    }
}

checkAfterHardening();
