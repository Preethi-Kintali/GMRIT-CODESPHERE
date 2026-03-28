import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "../src/models/Problem.js";

// Inline copy of PROBLEMS object
const PROBLEMS = {
  "two-sum": {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array • Hash Table",
    description: {
      text: "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.",
      notes: [
        "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "You can return the answer in any order.",
      ],
    },
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists",
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) { }\n`,
      python: `def twoSum(nums, target):\n    pass\n`,
      java: `class Main { public static int[] twoSum(int[] nums, int target) { return new int[0]; } }\n`,
    },
    expectedOutput: {
      javascript: "[ 0, 1 ]\n[ 1, 2 ]\n[ 0, 1 ]",
      python: "[0, 1]\n[1, 2]\n[0, 1]",
      java: "[0, 1]\n[1, 2]\n[0, 1]",
    },
  },
  "reverse-string": {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "String • Two Pointers",
    description: {
      text: "Write a function that reverses a string. The input string is given as an array of characters s.",
      notes: ["You must do this by modifying the input array in-place with O(1) extra memory."],
    },
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁵"],
    starterCode: {
      javascript: `function reverseString(s) {}\n`,
      python: `def reverseString(s):\n    pass\n`,
      java: `class Main { public static void reverseString(char[] s) {} }\n`,
    },
    expectedOutput: {
      javascript: "[ 'o', 'l', 'l', 'e', 'h' ]",
      python: "['o', 'l', 'l', 'e', 'h']",
      java: "[o, l, l, e, h]",
    },
  }
};

// Load environment variables
import path from "path";
const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, ".env") });

const MONGO_URI = process.env.DB_URL;

const seedDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("DB_URL is not defined in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB.");

    // Clear existing problems to avoid duplicates during seeding
    await Problem.deleteMany({});
    console.log("Cleared existing problems.");

    const problemsToInsert = Object.values(PROBLEMS).map((p) => ({
      title: p.title,
      slug: p.id,
      difficulty: p.difficulty,
      category: [p.category],
      description: p.description,
      examples: p.examples.map((ex) => ({
        input: ex.input || "",
        output: ex.output || "",
        explanation: ex.explanation || "",
      })),
      constraints: p.constraints,
      starterCode: {
        javascript: p.starterCode.javascript || "",
        python: p.starterCode.python || "",
        java: p.starterCode.java || "",
      },
      expectedOutput: {
        javascript: p.expectedOutput.javascript || "",
        python: p.expectedOutput.python || "",
        java: p.expectedOutput.java || "",
      },
      isPublished: true,
    }));

    await Problem.insertMany(problemsToInsert);
    console.log(`Successfully inserted ${problemsToInsert.length} problems!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding DB:", error);
    process.exit(1);
  }
};

seedDB();
