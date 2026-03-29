import User from "../models/User.js";

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-clerkId"); // Exclude secret IDs
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching my profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, bio, title, skills, githubUrl, leetcodeUrl, linkedinUrl, resumeUrl } = req.body;

    // Check for unique username constraints if provided
    if (username) {
       const existingUsernameUser = await User.findOne({ username, _id: { $ne: userId } });
       if (existingUsernameUser) {
          return res.status(400).json({ message: "This username is already taken. Please choose another one." });
       }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username,
          bio,
          title,
          skills,
          githubUrl,
          leetcodeUrl,
          linkedinUrl,
          resumeUrl,
          hasCompletedProfile: true,
        }
      },
      { new: true }
    ).select("-clerkId");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "Profile successfully updated!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists." });
    }
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
