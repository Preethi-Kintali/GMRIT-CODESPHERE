import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
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
