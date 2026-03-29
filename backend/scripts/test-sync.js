import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.DB_URL;
    if (!uri) throw new Error('No DB connection string');
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const sessions = await db.collection('sessions').find({}).limit(5).toArray();
    console.log('sessions sample:', sessions);
    process.exit(0);
  } catch (e) {
    console.error('error', e);
    process.exit(1);
  }
})();
