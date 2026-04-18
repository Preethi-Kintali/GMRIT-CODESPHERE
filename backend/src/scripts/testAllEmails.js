import "../lib/setup.js";
import { 
    sendInterviewInvite, 
    sendCancellationNotice, 
    sendEmailOtp, 
    sendSecurityTerminationNotice 
} from "../lib/email.js";

const TEST_EMAIL = "jhansibonu1@gmail.com";

const runTests = async () => {
    const params = {
        interviewerEmail: TEST_EMAIL,
        interviewerName: "Lead Interviewer",
        candidateEmail: TEST_EMAIL,
        candidateName: "Top Candidate",
        problemTitle: "Binary Tree Maximum Path Sum",
        scheduledAt: new Date().toISOString(),
        duration: 45,
        interviewerLink: "http://localhost:5173/interviewer-test",
        candidateLink: "http://localhost:5173/candidate-test",
        userEmail: TEST_EMAIL,
        userName: "John Doe",
        otpCode: "987654",
        reason: "Multiple fullscreen exits detected during the session."
    };

    console.log("--- STARTING COMPREHENSIVE EMAIL TEST ---");

    try {
        console.log("\n1. Testing: Interview Invitation...");
        const inviteRes = await sendInterviewInvite(params);
        console.log("Invite Result:", inviteRes.success ? "✅ SUCCESS" : "❌ FAILED", inviteRes.error || "");

        console.log("\n2. Testing: Cancellation Notice...");
        const cancelRes = await sendCancellationNotice(params);
        console.log("Cancellation Result:", cancelRes.success ? "✅ SUCCESS" : "❌ FAILED", cancelRes.error || "");

        console.log("\n3. Testing: Verification OTP...");
        const otpRes = await sendEmailOtp(params);
        console.log("OTP Result:", otpRes.success ? "✅ SUCCESS" : "❌ FAILED", otpRes.error || "");

        console.log("\n4. Testing: Security Termination...");
        const termRes = await sendSecurityTerminationNotice(params);
        console.log("Termination Result:", termRes.success ? "✅ SUCCESS" : "❌ FAILED", termRes.error || "");

        console.log("\n--- TEST COMPLETE ---");
        process.exit(0);
    } catch (error) {
        console.error("Critical Test Error:", error);
        process.exit(1);
    }
};

runTests();
