import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config(); // Fallback to default search if needed

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Nodemailer Verification Failed:', error.message);
  } else {
    console.log('🚀 Nodemailer is ready to send emails');
  }
});

/**
 * Sends an email using Nodemailer (Gmail).
 */
export async function sendInvite({ to, subject, html, from }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials missing – cannot send email');
    return { error: 'Missing credentials' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: from || `GMRIT CodeSphere <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent successfully to:', to, 'ID:', info.messageId);
    return { success: true, data: info };
  } catch (err) {
    console.error('❌ Nodemailer Error for:', to, err.message);
    return { error: err };
  }
}
