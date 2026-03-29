import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function runMigration() {
  try {
    const uri = process.env.MONGODB_URI || process.env.DB_URL;
    if (!uri) throw new Error("No MongoDB connection string found in environment variables (MONGODB_URI or DB_URL).");
    
    console.log("⏳ Connecting to Database...");
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    console.log("✅ connected to MongoDB");
    
    // --- PROBLEMS SYNC ---
    console.log("\n🔄 Syncing Problems collection...");
    const problemsCol = db.collection("problems");
    const problems = await problemsCol.find({}).toArray();
    let pCount = 0;
    
    for (const p of problems) {
      const updateDoc = { $set: {} };
      
      // Fix Slug
      if (!p.slug && p.title) {
        updateDoc.$set.slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(2).toString("hex");
      }
      
      // Fix Description (if it was somehow saved as a string in v1)
      if (typeof p.description === "string") {
        updateDoc.$set.description = { text: p.description, notes: [] };
      } else if (!p.description || !p.description.text) {
        updateDoc.$set.description = { text: p.description?.text || "Problem description pending...", notes: [] };
      }
      
      // Fix Difficulty
      if (!p.difficulty) updateDoc.$set.difficulty = "Medium";
      
      // Fix Published
      if (p.isPublished === undefined) updateDoc.$set.isPublished = true;
      
      if (Object.keys(updateDoc.$set).length > 0) {
        await problemsCol.updateOne({ _id: p._id }, updateDoc);
        pCount++;
      }
    }
    console.log(`👉 Updated ${pCount} outdated Problem documents.`);

    // --- SESSIONS SYNC ---
    console.log("\n🔄 Syncing Sessions collection...");
    const sessionsCol = db.collection("sessions");
    const sessions = await sessionsCol.find({}).toArray();
    let sCount = 0;
    
    for (const s of sessions) {
      const updateDoc = { $set: {} };
      
      // Fix missing required fields for V2 schema
      if (!s.duration) updateDoc.$set.duration = 60;
      if (!s.scheduledAt) updateDoc.$set.scheduledAt = s.createdAt || new Date();
      if (!s.status) updateDoc.$set.status = "completed"; // Assume old are done
      
      // Missing tokens for the new token-gated entry
      if (!s.interviewerToken) updateDoc.$set.interviewerToken = crypto.randomUUID();
      if (!s.candidateToken) updateDoc.$set.candidateToken = crypto.randomUUID();
      
      if (Object.keys(updateDoc.$set).length > 0) {
        await sessionsCol.updateOne({ _id: s._id }, updateDoc);
        sCount++;
      }
    }
    console.log(`👉 Updated ${sCount} outdated Session documents.`);
    
    // --- USERS SYNC ---
    console.log("\n🔄 Syncing Users collection...");
    const usersCol = db.collection("users");
    const users = await usersCol.find({}).toArray();
    let uCount = 0;
    
    for (const u of users) {
       const updateDoc = { $set: {} };
       
       // Ensure role exists
       if (!u.role) updateDoc.$set.role = "candidate";
       
       // Ensure active flag
       if (u.isActive === undefined) updateDoc.$set.isActive = true;
       
       if (Object.keys(updateDoc.$set).length > 0) {
         await usersCol.updateOne({ _id: u._id }, updateDoc);
         uCount++;
       }
    }
    console.log(`👉 Updated ${uCount} outdated User documents.`);

    console.log("\n🎉 Database Synchronization Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
