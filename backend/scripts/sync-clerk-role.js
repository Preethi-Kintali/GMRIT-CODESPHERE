import { clerkClient } from "@clerk/express";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || process.env.DB_URL;
const targetEmail = 'dineshjammu143@gmail.com';

async function syncClerk() {
  try {
    await mongoose.connect(uri);
    const User = mongoose.model('User', new mongoose.Schema({ email: String, clerkId: String, role: String }), 'users');
    const user = await User.findOne({ email: targetEmail });
    
    if (!user) {
      console.log(`⚠️ No user found in DB with email ${targetEmail}`);
      return;
    }

    if (!user.clerkId) {
      console.log(`⚠️ No clerkId found for user ${targetEmail}. Cannot sync to Clerk.`);
      return;
    }

    console.log(`🔄 Syncing role "${user.role}" to Clerk for ${targetEmail}...`);
    
    // Update Clerk Metadata
    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: {
        role: user.role
      }
    });

    console.log(`✅ Clerk publicMetadata updated for ${targetEmail}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

syncClerk();
