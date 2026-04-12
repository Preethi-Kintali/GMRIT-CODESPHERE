import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

/**
 * SendGrid Email Service
 */
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendInvite({ to, subject, html, from }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY missing – cannot send email');
    return { error: 'Missing API Key' };
  }
  
  const msg = {
    to,
    from: from || 'GMRIT CodeSphere <notifications@gmrit-codesphere.com>', // Verified sender in SendGrid
    subject,
    html,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid to:', to, 'Status:', response.statusCode);
    return { success: true, data: response };
  } catch (err) {
    console.error('❌ SendGrid Error for:', to, err.response?.body?.errors || err.message);
    return { error: err };
  }
}
