import Problem from "../models/Problem.js";

// Public: Get all published problems
export const getPublishedProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ isPublished: true }).select("-expectedOutput");
    res.json(problems);
  } catch (error) {
    console.error("Error fetching published problems:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Public: Get a single published problem by slug
export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await Problem.findOne({ slug, isPublished: true });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin: Get all problems (including drafts)
export const getAdminProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    console.error("Error fetching admin problems:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin: Create a new problem
export const createProblem = async (req, res) => {
  try {
    const problemData = req.body;
    problemData.createdBy = req.user._id;

    // Generate slug from title if not provided
    if (!problemData.slug && problemData.title) {
      problemData.slug = problemData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    const problem = await Problem.create(problemData);
    res.status(201).json(problem);
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(400).json({ message: "Failed to create problem", error: error.message });
  }
};

// Admin: Update a problem
export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const problem = await Problem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.json(problem);
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(400).json({ message: "Failed to update problem", error: error.message });
  }
};
