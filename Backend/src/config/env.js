import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // Databases
  DATABASE_URL: process.env.DATABASE_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "devmatrix",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "73db60863b5a55d90a3b70f90a9ea7501d649cea3b030ff48036109b7f90365dc9ac28988627191352234b606d1388b5e9b404e672234119393265937d856538",
  IDEMPOTENCY_KEY: process.env.IDEMPOTENCY_KEY || "66d04b5e-5905-4c76-afe1-f97ba02234fd",

  // Google OAuth & Mailer
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER: process.env.GOOGLE_USER,
  EMAIL_USER: process.env.EMAIL_USER || process.env.GOOGLE_USER,
  EMAIL_PASS: process.env.EMAIL_PASS || "",

  // GitHub OAuth
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  PAYMENT_CURRENCY: process.env.PAYMENT_CURRENCY || "INR",
};

export default config;
