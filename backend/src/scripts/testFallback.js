import "../lib/setup.js";
import { sendInterviewInvite } from "../lib/email.js";

const UNVERIFIED_EMAIL = "antigravity.test.recipient@gmail.com"; 

const testFallback = async () => {
    console.log("--- TESTING EMAIL FALLBACK (RESEND -> GMAIL) ---");
    console.log("Targeting an unverified email (should trigger Resend error and Gmail fallback):", UNVERIFIED_EMAIL);

    const params = {
        interviewerEmail: UNVERIFIED_EMAIL,
        interviewerName: "Fallback Tester",
        candidateEmail: "jhansibonu1@gmail.com", // Keeping owner email for candidate to see split behavior
        candidateName: "Owner Candidate",
        problemTitle: "System Fallback Verification",
        scheduledAt: new Date().toISOString(),
        duration: 30,
        interviewerLink: "http://localhost:5173/test",
        candidateLink: "http://localhost:5173/test"
    };

    try {
        const result = await sendInterviewInvite(params);
        console.log("\nFinal Result:", result.success ? "✅ SUCCESS" : "❌ FAILED");
        if (result.error) console.log("Final Error Trace:", result.error);
        
        process.exit(0);
    } catch (error) {
        console.error("Test execution failed:", error);
        process.exit(1);
    }
};

testFallback();
