import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;
      if (!clerkId)
        return res.status(401).json({ message: "Unauthorized - invalid token" });

      // find user in db by clerk Id
      let user = await User.findOne({ clerkId });
      
      const clerkUser = await clerkClient.users.getUser(clerkId).catch(() => null);
      if (!clerkUser) return res.status(401).json({ message: "Clerk user not found" });

      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";
      const profileImage = clerkUser.imageUrl || "";
      const metadataRole = clerkUser.publicMetadata?.role || "candidate";

      // If user doesn't exist, create/upsert
      if (!user) {
        user = await User.findOneAndUpdate(
          { $or: [{ clerkId }, { email }] },
          {
            $set: {
              clerkId,
              email,
              name,
              profileImage,
              role: metadataRole,
            }
          },
          { new: true, upsert: true }
        );
      } else {
        // If user exists, check for staleness
        const isStale = user.email !== email || user.name !== name || user.profileImage !== profileImage || user.role !== metadataRole;
        if (isStale) {
          user.email = email;
          user.name = name;
          user.profileImage = profileImage;
          user.role = metadataRole;
          await user.save();
        }
      }

      // attach user to req
      req.user = user;
      next();

    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
