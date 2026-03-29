import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || process.env.DB_URL;
if (!uri) {
  console.error('❌ No MongoDB connection string found in environment variables.');
  process.exit(1);
}

const targetEmail = 'dineshjammu143@gmail.com';

async function promote() {
  try {
    await mongoose.connect(uri);
    const User = mongoose.model('User', new mongoose.Schema({}), 'users'); // use existing collection
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.log(`⚠️ No user found with email ${targetEmail}`);
      return;
    }
    if (user.role === 'admin') {
      console.log('✅ User is already an admin.');
      return;
    }
    user.role = 'admin';
    await user.save();
    console.log(`✅ Successfully promoted ${targetEmail} to admin.`);
  } catch (err) {
    console.error('❌ Promotion failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

promote();
