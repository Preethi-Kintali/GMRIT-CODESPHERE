import { connectDB } from "../lib/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const syncUsernames = async () => {
  try {
    await connectDB();
    console.log("Connected to Database. Starting synchronization...");

    // Find users where username doesn't exist or is empty
    const usersWithoutUsername = await User.find({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: "" }
      ]
    });
    
    console.log(`Found ${usersWithoutUsername.length} legacy users needing a username...`);

    let updatedCount = 0;
    for (const user of usersWithoutUsername) {
       const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, "") : "user";
       const newUsername = `${emailPrefix}${Math.floor(Math.random() * 10000)}`;
       
       user.username = newUsername;
       await user.save();
       updatedCount++;
       console.log(`[SUCCESS] Patched user ${user.email} -> ${newUsername}`);
    }

    console.log(`Finished. Synchronized ${updatedCount} legacy users.`);
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Fatal Error syncing usernames:", error);
    process.exit(1);
  }
};

syncUsernames();
