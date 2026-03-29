import "./src/lib/setup.js";
import { connectDB } from "./src/lib/db.js";
import User from "./src/models/User.js";
import mongoose from "mongoose";
import { clerkClient } from "@clerk/express";

const promoteClerkAdmin = async () => {
  try {
    await connectDB();
    
    const email = "dineshjammu143@gmail.com";
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found in DB.`);
      process.exit(1);
    }
    
    // Update the Clerk user publicMetadata
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        role: "admin",
      },
    });
    
    console.log(`Successfully updated ${email}'s role to admin in Clerk!`);

  } catch (error) {
    console.error("Error updating Clerk metadata:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

promoteClerkAdmin();
