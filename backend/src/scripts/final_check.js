import { sendInterviewInvite } from "../lib/email.js";
import dotenv from "dotenv";

dotenv.config();

async function checkNow() {
    console.log("Checking Resend API Key:", process.env.RESEND_API_KEY?.slice(0, 5) + "...");
    
    try {
        const res = await sendInterviewInvite({
            interviewerEmail: "jhansibonu1@gmail.com",
            interviewerName: "Test",
            candidateEmail: "jhansibonu1@gmail.com",
            candidateName: "Test",
            problemTitle: "Test",
            scheduledAt: new Date(),
            duration: 30,
            interviewerLink: "http://test.com",
            candidateLink: "http://test.com"
        });
        console.log("Result:", res);
    } catch (e) {
        console.error("Exec Error:", e);
    }
}

checkNow();
