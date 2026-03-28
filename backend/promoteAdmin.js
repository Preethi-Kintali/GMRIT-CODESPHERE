import "./src/lib/setup.js";
import { connectDB } from "./src/lib/db.js";
import User from "./src/models/User.js";
import mongoose from "mongoose";

const promoteAdmin = async () => {
  try {
    await connectDB();
    
    const email = "dineshjammu143@gmail.com";
    
    // Update only the specific user account to "admin"
    const result = await User.updateOne(
      { email: email }, 
      { $set: { role: "admin" } }
    );
    
    if (result.matchedCount === 0) {
      console.log(`User with email ${email} not found in the database. Please ensure you have logged in at least once.`);
    } else if (result.modifiedCount > 0) {
      console.log(`Successfully promoted ${email} to admin!`);
    } else {
      console.log(`User ${email} is already an admin.`);
    }

  } catch (error) {
    console.error("Error promoting user:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

promoteAdmin();
