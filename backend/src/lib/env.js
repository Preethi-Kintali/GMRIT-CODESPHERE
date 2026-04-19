import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requiredEnvVars = [
  "DB_URL",
  "STREAM_API_KEY",
  "STREAM_API_SECRET",
  "CLERK_SECRET_KEY"
];

const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0 && process.env.NODE_ENV === "production") {
  console.error(`❌ CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

export const ENV = {
  PORT: process.env.PORT || 5000,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'resend', // 'resend' or 'gmail'
  EMAIL_FROM: process.env.EMAIL_FROM || 'GMRIT CodeSphere <onboarding@resend.dev>',
};

