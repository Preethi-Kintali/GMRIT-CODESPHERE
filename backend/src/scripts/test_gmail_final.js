import { sendInterviewInvite } from "../lib/email.js";
import dotenv from "dotenv";

dotenv.config();

async function testGmailFinal() {
    console.log("🚀 Testing Gmail Rollback Activation...");
    console.log("USER:", process.env.GMAIL_USER);
    
    const params = {
        interviewerEmail: "dineshjammu143@gmail.com",
        interviewerName: "Dinesh Jammu",
        candidateEmail: "dineshjammu143@gmail.com",
        candidateName: "Test Candidate",
        problemTitle: "Optimal Pathfinding in Graphs",
        scheduledAt: new Date(),
        duration: 45,
        interviewerLink: "https://gmrit-codesphere.onrender.com/",
        candidateLink: "https://gmrit-codesphere.onrender.com/",
    };

    try {
        const result = await sendInterviewInvite(params);
        console.log("Gmail Success Result:", result);
    } catch (err) {
        console.error("Gmail Critical Failure:", err);
    }
}

testGmailFinal();
