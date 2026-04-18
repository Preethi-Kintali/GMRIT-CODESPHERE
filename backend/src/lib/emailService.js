import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { ENV } from './env.js';

const resend = new Resend(ENV.RESEND_API_KEY);

const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
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
  const primaryStrategy = ENV.EMAIL_SERVICE || 'resend';
  const sender = from || ENV.EMAIL_FROM;

  console.log(`📡 Dispatching email to ${to} using ${primaryStrategy}...`);

  let result;
  if (primaryStrategy === 'resend') {
    result = await sendWithResend({ to, subject, html, from: sender });
  } else {
    result = await sendWithGmail({ to, subject, html, from: sender });
  }

  // Automatic Fallback Strategy:
  // If Resend (primary) fails and Gmail is configured, try Gmail as a backup.
  if (result.error && primaryStrategy === 'resend' && ENV.GMAIL_USER && ENV.GMAIL_APP_PASSWORD) {
    console.warn(`⚠️ Primary (Resend) failed for ${to}. Attempting fallback to Gmail...`);
    result = await sendWithGmail({ to, subject, html, from: sender });
  }

  return result;
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

