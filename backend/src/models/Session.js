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
    interviewerOtp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    isVerified: { type: Boolean, default: false }, // for candidate
    isInterviewerVerified: { type: Boolean, default: false },
    interviewerAcceptedGuidelines: { type: Boolean, default: false },
    candidateAcceptedGuidelines: { type: Boolean, default: false },
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
    interviewerCheckedIn: { type: Boolean, default: false },
    candidateCheckedIn: { type: Boolean, default: false },
    interviewerCheckedInAt: { type: Date },
    candidateCheckedInAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Optimized indexes for scheduling and lookups
sessionSchema.index({ interviewer: 1, scheduledAt: 1 });
sessionSchema.index({ candidate: 1, scheduledAt: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ scheduledAt: 1 });

export default mongoose.model("Session", sessionSchema);
