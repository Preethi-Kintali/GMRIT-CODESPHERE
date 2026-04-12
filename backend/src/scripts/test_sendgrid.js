import { sendInterviewInvite } from "../lib/email.js";
import dotenv from "dotenv";

dotenv.config();

async function testSendGrid() {
    console.log("🚀 Testing SendGrid Activation...");
    console.log("FROM:", "dineshjammu143@gmail.com");
    
    const params = {
        interviewerEmail: "dineshjammu143@gmail.com",
        interviewerName: "Dinesh Test",
        candidateEmail: "dineshjammu143@gmail.com",
        candidateName: "Candidate Test",
        problemTitle: "Binary Search Implementation",
        scheduledAt: new Date(),
        duration: 60,
        interviewerLink: "https://gmrit-codesphere.onrender.com/",
        candidateLink: "https://gmrit-codesphere.onrender.com/",
    };

    try {
        const result = await sendInterviewInvite(params);
        console.log("SendGrid Result:", result);
    } catch (err) {
        console.error("Critical Failure:", err);
    }
}

testSendGrid();
