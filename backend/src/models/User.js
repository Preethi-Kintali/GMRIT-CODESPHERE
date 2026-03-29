import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "interviewer", "candidate"],
      default: "candidate",
    },
    department: {
      type: String,
    },
    // Maintained specifically for backend routing/interviewer matching historically
    expertise: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Standard User Profile Fields
    username: {
      type: String,
      unique: true,
      sparse: true,
    },
    bio: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      default: "",
    },
    leetcodeUrl: {
      type: String,
      default: "",
    },
    linkedinUrl: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    hasCompletedProfile: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

const User = mongoose.model("User", userSchema);

export default User;
