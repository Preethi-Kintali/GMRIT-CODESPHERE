import mongoose from "mongoose";
import User from "../src/models/User.js";
import { ENV } from "../src/lib/env.js";
import "../src/lib/setup.js";

async function makeAdmin() {
  try {
    await mongoose.connect(ENV.DB_URL);
    console.log("Connected to MongoDB.");

    // Find the first user or let's just make all current users admins for testing
    const result = await User.updateMany({}, { $set: { role: "admin" } });
    console.log(`Updated \${result.modifiedCount} user(s) to have the admin role in MongoDB!`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error updating users:", error);
    process.exit(1);
  }
}

makeAdmin();
