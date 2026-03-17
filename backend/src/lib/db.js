import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    if (!ENV.DB_URL) {
      throw new Error("DB_URL is not defined in environment variables");
    }
    const conn = await mongoose.connect(ENV.DB_URL, {
      serverSelectionTimeoutMS: 30000, // wait up to 30s for server selection (default 3s)
      connectTimeoutMS: 30000,          // wait up to 30s for initial connection
      socketTimeoutMS: 45000,           // wait up to 45s for socket operations
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB ${error}`);
    process.exit(1); // 0 means success, 1 means failure
  }
};
