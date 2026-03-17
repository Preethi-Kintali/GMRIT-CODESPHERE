import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;
      if (!clerkId)
        return res.status(401).json({ message: "Unauthorized - invalid token" });

      //   find user in db by clerk Id
      let user = await User.findOne({ clerkId });
      
      // Auto-sync user if they are missing in the DB but authenticated via Clerk
      // This fixes vanished users if the DB was wiped or webhook failed.
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        user = await User.create({
          clerkId,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
          profileImage: clerkUser.imageUrl || "",
        });
      }

      //   attach user to req
      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
