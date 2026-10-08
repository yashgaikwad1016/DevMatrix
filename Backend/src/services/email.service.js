import nodemailer from "nodemailer";
import config from "../config/env.js";

let oauthTransporter = null;
let passTransporter = null;

const initTransporters = () => {
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_REFRESH_TOKEN && config.GOOGLE_USER) {
    try {
      oauthTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: config.GOOGLE_USER,
          clientId: config.GOOGLE_CLIENT_ID,
          clientSecret: config.GOOGLE_CLIENT_SECRET,
          refreshToken: config.GOOGLE_REFRESH_TOKEN,
        },
      });
    } catch (err) {
      console.warn("Failed to create OAuth2 transporter:", err.message);
    }
  }

  if (config.EMAIL_USER && config.EMAIL_PASS) {
    try {
      passTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS,
        },
      });
    } catch (err) {
      console.warn("Failed to create password transporter:", err.message);
    }
  }
};

initTransporters();

export const sendEmail = async (to, subject, text, html) => {
  // 1. Try OAuth transporter first if configured
  if (oauthTransporter) {
    try {
      const info = await oauthTransporter.sendMail({
        from: `"DevMatrix" <${config.GOOGLE_USER || "noreply@devmatrix.com"}>`,
        to,
        subject,
        text,
        html,
      });
      console.log("Email sent successfully via Google OAuth2: %s", info.messageId);
      return info;
    } catch (oauthErr) {
      console.warn("OAuth2 email delivery failed (%s). Attempting fallback...", oauthErr.message);
    }
  }

  // 2. Try App Password transporter if configured
  if (passTransporter) {
    try {
      const info = await passTransporter.sendMail({
        from: `"DevMatrix" <${config.EMAIL_USER || "noreply@devmatrix.com"}>`,
        to,
        subject,
        text,
        html,
      });
      console.log("Email sent successfully via Gmail SMTP: %s", info.messageId);
      return info;
    } catch (passErr) {
      console.warn("Gmail App Password delivery failed: %s", passErr.message);
    }
  }

  // 3. Fallback mock log when no transporter succeeds
  console.log(`[Email Fallback / Mock Mode] To: ${to} | Subject: ${subject}`);
  return { fallback: true, mock: true };
};

export default { sendEmail };
