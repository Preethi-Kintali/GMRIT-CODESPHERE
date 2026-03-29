import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true, // scheduled start time
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled",
    },
    callId: {
      type: String,
      default: "",
    },
    interviewerToken: { type: String, required: true },
    candidateToken: { type: String, required: true },
    candidateOtp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    isVerified: { type: Boolean, default: false },
    violationCount: { type: Number, default: 0 },
    terminationReason: { type: String },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      notes: { type: String },
      recommendation: { type: String, enum: ["Hire", "Consider", "Reject"] },
    },
    candidateFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      notes: { type: String },
      submittedAt: { type: Date },
    },
    finalCode: { type: String, default: "" },
    finalLanguage: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);
