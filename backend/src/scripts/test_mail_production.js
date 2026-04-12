import { sendInterviewInvite } from "../lib/email.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

async function testMail() {
    console.log("🚀 Starting Production Domain Test...");
    console.log("FROM:", "admin@mail.codesphere.com");
    
    const params = {
        interviewerEmail: "jhansibonu1@gmail.com",
        interviewerName: "Test Interviewer",
        candidateEmail: "jhansibonu1@gmail.com",
        candidateName: "Test Candidate",
        problemTitle: "Binary Search",
        scheduledAt: new Date(),
        duration: 60,
        interviewerLink: "https://gmrit-codesphere.onrender.com/",
        candidateLink: "https://gmrit-codesphere.onrender.com/",
    };

    try {
        const result = await sendInterviewInvite(params);
        console.log("Result:", result);
    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testMail();
