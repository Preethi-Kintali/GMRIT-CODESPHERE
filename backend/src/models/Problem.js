import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    category: { type: [String], default: [] },
    description: {
      text: { type: String, required: true },
      notes: { type: [String], default: [] },
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: { type: [String], default: [] },
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
    },
    expectedOutput: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
    },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);
