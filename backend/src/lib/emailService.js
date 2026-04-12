import nodemailer from 'nodemailer';
import { ENV } from './env.js';

/**
 * Standardized Email Transporter (Production Verified)
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: ENV.GMAIL_USER,
    pass: ENV.GMAIL_APP_PASSWORD,
  },
});

export async function sendInvite({ to, subject, html, from }) {
  if (!ENV.GMAIL_USER || !ENV.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials missing in ENV – cannot send email');
    return { error: 'Missing credentials' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: from || `GMRIT CodeSphere <${ENV.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent successfully via Gmail to:', to, 'ID:', info.messageId);
    return { success: true, data: info };
  } catch (err) {
    console.error('❌ Gmail Error for:', to, err.message);
    return { error: err };
  }
}
