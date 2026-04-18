import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { ENV } from './env.js';

const resend = new Resend(ENV.RESEND_API_KEY);

const gmailTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: ENV.GMAIL_USER,
    pass: ENV.GMAIL_APP_PASSWORD,
  },
});

/**
 * Standardized Email Service (Production Ready)
 * Supports 'resend' and 'gmail' strategies
 */
export async function sendInvite({ to, subject, html, from }) {
  const strategy = ENV.EMAIL_SERVICE || 'resend';
  const sender = from || ENV.EMAIL_FROM;

  if (strategy === 'resend') {
    return await sendWithResend({ to, subject, html, from: sender });
  } else if (strategy === 'gmail') {
    return await sendWithGmail({ to, subject, html, from: sender });
  } else {
    console.error(`❌ Unknown email strategy: ${strategy}`);
    return { error: 'Invalid configuration' };
  }
}

async function sendWithResend({ to, subject, html, from }) {
  if (!ENV.RESEND_API_KEY) {
    console.error('❌ Resend API Key missing in ENV');
    return { error: 'Missing credentials' };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
       console.error('❌ Resend Error for:', to, error);
       return { error };
    }

    console.log('✅ Email sent successfully via Resend to:', to, 'ID:', data.id);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Resend Execution Error:', err.message);
    return { error: err };
  }
}

async function sendWithGmail({ to, subject, html, from }) {
  if (!ENV.GMAIL_USER || !ENV.GMAIL_APP_PASSWORD) {
     console.error('❌ Gmail credentials missing in ENV');
     return { error: 'Missing credentials' };
  }

  try {
    const info = await gmailTransporter.sendMail({
      from,
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

