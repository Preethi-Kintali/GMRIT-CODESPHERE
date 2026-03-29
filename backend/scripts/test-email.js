import { sendInterviewInvite } from '../src/lib/email.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function test() {
  console.log('🚀 Testing Email Sending...');
  try {
    const res = await sendInterviewInvite({
      interviewerEmail: 'dineshjammu143@gmail.com', // user's email
      interviewerName: 'Dinesh',
      candidateEmail: 'dineshjammu143@gmail.com',
      candidateName: 'Test Candidate',
      problemTitle: 'Two Sum',
      scheduledAt: new Date(),
      duration: 60,
      interviewerLink: 'http://localhost:5173/test',
      candidateLink: 'http://localhost:5173/test'
    });
    console.log('🏁 Test Result:', res);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

test();
