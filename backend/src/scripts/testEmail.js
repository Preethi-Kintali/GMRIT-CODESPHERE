import "../lib/setup.js";
import { sendInterviewInvite } from "../lib/email.js";
import { ENV } from "../lib/env.js";

const test = async () => {
    console.log("Testing email with user:", ENV.GMAIL_USER);
    try {
        const result = await sendInterviewInvite({
            interviewerEmail: "jhansibonu1@gmail.com",
            interviewerName: "Test Interviewer",
            candidateEmail: "jhansibonu1@gmail.com",
            candidateName: "Test Candidate",
            problemTitle: "Test Problem",
            scheduledAt: new Date().toISOString(),
            duration: 60,
            interviewerLink: "http://localhost:5173/test",
            candidateLink: "http://localhost:5173/test"
        });
        console.log("Result:", result);
        process.exit(0);
    } catch (error) {
        console.error("Test Failed:", error);
        process.exit(1);
    }
};

test();
