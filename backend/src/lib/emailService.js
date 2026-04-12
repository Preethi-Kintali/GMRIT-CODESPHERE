import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Resend Email Service (Production Ready)
 */
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvite({ to, subject, html, from }) {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY missing – cannot send email');
    return { error: 'Missing API Key' };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: from || 'GMRIT CodeSphere <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
       console.error('❌ Resend Error for:', to, error.message);
       return { error };
    }

    console.log('✅ Email sent successfully via Resend to:', to, 'ID:', data.id);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Resend Exception for:', to, err.message);
    return { error: err };
  }
}
