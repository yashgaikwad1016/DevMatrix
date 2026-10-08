import crypto from "crypto";
import jwt from "jsonwebtoken";
import axios from "axios";
import config from "../config/env.js";
import { prisma } from "../config/database.js";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import otpModel from "../models/otp.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtphtml } from "../utils/utils.js";
import { sha256, hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { generateReferralCode } from "../utils/numberGenerators.js";

// ==========================================
// 1. REGISTER
// ==========================================
export async function register(req, res) {
  try {
    const {
      name,
      username,
      email,
      password,
      mobile,
      college,
      university,
      user_type = "student",
      role = "client",
      referral_code_used,
    } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const displayName = (name || username || "").trim();

    if (!normalizedEmail || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // Check existing in MySQL
    const existingMySQL = await prisma.users.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingMySQL) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Check referral code
    let referrerUser = null;
    if (referral_code_used) {
      referrerUser = await prisma.users.findUnique({
        where: { referral_code: referral_code_used.trim().toUpperCase() },
      });
    }

    // Password hash (store standard bcrypt and sha256 for backwards compatibility)
    const hashedPassword = await hashPassword(password);
    const shaPassword = sha256(password);
    const generatedRefCode = generateReferralCode(displayName);

    // 1. Create in MySQL
    const newUser = await prisma.users.create({
      data: {
        name: displayName,
        email: normalizedEmail,
        password_hash: hashedPassword,
        mobile: mobile || null,
        college: college || null,
        university: university || null,
        user_type: ["student", "employee", "other"].includes(user_type) ? user_type : "student",
        role: ["admin", "developer", "client"].includes(role) ? role : "client",
        referral_code: generatedRefCode,
        referred_by: referrerUser ? referrerUser.id : null,
        is_email_verified: false,
        is_active: true,
      },
    });

    // If referred, create referral record
    if (referrerUser) {
      try {
        const refSetting = await prisma.referral_settings.findFirst({
          where: { enabled: true },
        });
        await prisma.referrals.create({
          data: {
            referrer_id: referrerUser.id,
            referred_user_id: newUser.id,
            referral_code: referrerUser.referral_code || referral_code_used,
            discount_type: refSetting ? refSetting.discount_type : "percentage",
            discount_value: refSetting ? refSetting.discount_value : 10.0,
            status: "registered",
          },
        });
      } catch (refErr) {
        console.warn("Could not record referral tracking:", refErr.message);
      }
    }

    // 2. Sync to MongoDB (for compatibility with jwt-auth-backend-system)
    let mongoUser = null;
    try {
      mongoUser = await userModel.findOne({ email: normalizedEmail });
      if (!mongoUser) {
        mongoUser = await userModel.create({
          username: displayName,
          email: normalizedEmail,
          password: shaPassword,
          verified: false,
          mobile,
          college,
          university,
          user_type,
          role: newUser.role,
          referral_code: generatedRefCode,
        });
      }
    } catch (mErr) {
      console.warn("MongoDB sync warning:", mErr.message);
    }

    // 3. Generate OTP
    const otp = generateOtp();
    const otpHash = sha256(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to MySQL email_verification_tokens
    await prisma.email_verification_tokens.deleteMany({
      where: { user_id: newUser.id },
    });
    await prisma.email_verification_tokens.create({
      data: {
        user_id: newUser.id,
        token_hash: otpHash,
        expires_at: expiresAt,
      },
    });

    // Save OTP to MongoDB otpModel
    if (mongoUser) {
      await otpModel.deleteMany({ email: normalizedEmail });
      await otpModel.create({
        email: normalizedEmail,
        user: mongoUser._id,
        otpHash,
      });
    }

    // Send email
    const html = getOtphtml(otp);
    await sendEmail(
      normalizedEmail,
      "Verify your DevMatrix Account - OTP Code",
      `Your DevMatrix verification code is ${otp}`,
      html
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent to your inbox.",
      user: {
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        user_type: newUser.user_type,
        college: newUser.college,
        university: newUser.university,
        is_email_verified: newUser.is_email_verified,
        referral_code: newUser.referral_code,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
      error: error.message,
    });
  }
}

// ==========================================
// 2. VERIFY EMAIL
// ==========================================
export async function verifyEmail(req, res) {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    email = email.trim().toLowerCase();
    const otpHash = sha256(String(otp).trim());

    // 1. Check in MySQL
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const tokenRecord = await prisma.email_verification_tokens.findFirst({
      where: {
        user_id: user.id,
        token_hash: otpHash,
        expires_at: { gt: new Date() },
        used_at: null,
      },
    });

    // Also check MongoDB OTP if available
    let mongoValid = false;
    try {
      const otpRecord = await otpModel.findOne({
        email,
        otpHash,
        expiresAt: { $gt: new Date() },
      });
      if (otpRecord) {
        mongoValid = true;
        await otpModel.deleteMany({ email });
        await userModel.updateOne({ email }, { verified: true });
      }
    } catch (mErr) {
      // ignore
    }

    if (!tokenRecord && !mongoValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code. Please request a new one.",
      });
    }

    // Mark as verified in MySQL
    if (tokenRecord) {
      await prisma.email_verification_tokens.update({
        where: { id: tokenRecord.id },
        data: { used_at: new Date() },
      });
    }

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { is_email_verified: true },
    });

    // Generate tokens so user can log in immediately
    const tokenPayload = {
      id: updatedUser.id.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      user: {
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        is_email_verified: true,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({ success: false, message: "Verification failed.", error: error.message });
  }
}

// ==========================================
// 3. RESEND OTP
// ==========================================
export async function resendOTP(req, res) {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await prisma.users.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.is_email_verified) {
      return res.status(400).json({ success: false, message: "Account is already verified." });
    }

    const otp = generateOtp();
    const otpHash = sha256(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.email_verification_tokens.deleteMany({ where: { user_id: user.id } });
    await prisma.email_verification_tokens.create({
      data: {
        user_id: user.id,
        token_hash: otpHash,
        expires_at: expiresAt,
      },
    });

    try {
      await otpModel.deleteMany({ email: normalizedEmail });
      const mUser = await userModel.findOne({ email: normalizedEmail });
      if (mUser) {
        await otpModel.create({
          email: normalizedEmail,
          user: mUser._id,
          otpHash,
        });
      }
    } catch (mErr) {
      // ignore
    }

    const html = getOtphtml(otp);
    await sendEmail(
      normalizedEmail,
      "DevMatrix - New OTP Code",
      `Your verification code is ${otp}`,
      html
    );

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ success: false, message: "Failed to resend OTP.", error: error.message });
  }
}

// ==========================================
// 4. LOGIN
// ==========================================
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await prisma.users.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password_hash || "");
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check verification status (skip strict check for admin/dev or if user is verified)
    if (!user.is_email_verified && user.role === "client") {
      return res.status(403).json({
        success: false,
        unverified: true,
        message: "Please verify your email with the OTP before logging in.",
      });
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    const tokenPayload = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = sha256(refreshToken);

    // Save session in MySQL
    await prisma.user_sessions.create({
      data: {
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        ip_address: req.ip || "",
        user_agent: req.headers["user-agent"] || "",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Save session in MongoDB
    try {
      const mUser = await userModel.findOne({ email: normalizedEmail });
      if (mUser) {
        await sessionModel.create({
          user: mUser._id,
          refreshTokenHash,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        });
      }
    } catch (mErr) {
      // ignore
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        college: user.college,
        university: user.university,
        mobile: user.mobile,
        referral_code: user.referral_code,
        is_email_verified: user.is_email_verified,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
}

// ==========================================
// 5. GET ME
// ==========================================
export async function getMe(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        college: user.college,
        university: user.university,
        mobile: user.mobile,
        profile_image_url: user.profile_image_url,
        referral_code: user.referral_code,
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching user details." });
  }
}

// ==========================================
// 6. REFRESH TOKEN
// ==========================================
export async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Refresh token not found." });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const tokenHash = sha256(token);

    const session = await prisma.user_sessions.findFirst({
      where: {
        refresh_token_hash: tokenHash,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({ success: false, message: "Session expired or invalid." });
    }

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    const newHash = sha256(newRefreshToken);

    await prisma.user_sessions.update({
      where: { id: session.id },
      data: { refresh_token_hash: newHash },
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid refresh token." });
  }
}

// ==========================================
// 7. LOGOUT & LOGOUT ALL
// ==========================================
export async function logout(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const tokenHash = sha256(token);
      await prisma.user_sessions.updateMany({
        where: { refresh_token_hash: tokenHash },
        data: { revoked_at: new Date() },
      });
    }

    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed." });
  }
}

export async function logoutAll(req, res) {
  try {
    if (req.user) {
      await prisma.user_sessions.updateMany({
        where: { user_id: req.user.id },
        data: { revoked_at: new Date() },
      });
    }
    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: "Logged out from all sessions." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout all failed." });
  }
}

// ==========================================
// 8. GOOGLE OAUTH
// ==========================================
export async function googleLogin(req, res) {
  try {
    const { token, profile, credential, code, redirect_uri, referral_code_used } = req.body;
    let email, name, googleId, picture;

    if (profile && profile.email) {
      email = profile.email;
      name = profile.name;
      googleId = profile.sub || profile.id;
      picture = profile.picture;
    } else if (credential) {
      // Decode JWT token from Google Identity Services
      try {
        const payload = jwt.decode(credential);
        if (payload && payload.email) {
          email = payload.email;
          name = payload.name;
          googleId = payload.sub;
          picture = payload.picture;
        }
      } catch (jwtErr) {
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        email = response.data.email;
        name = response.data.name;
        googleId = response.data.sub;
        picture = response.data.picture;
      }
    } else if (token) {
      // Fetch from Google UserInfo API
      const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      email = response.data.email;
      name = response.data.name;
      googleId = response.data.sub;
      picture = response.data.picture;
    } else if (code) {
      // Exchange code for token
      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirect_uri || `${config.CLIENT_URL}/auth/callback`,
        grant_type: "authorization_code",
      });
      if (tokenRes.data.access_token) {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenRes.data.access_token}` },
        });
        email = response.data.email;
        name = response.data.name;
        googleId = response.data.sub;
        picture = response.data.picture;
      } else if (tokenRes.data.id_token) {
        const payload = jwt.decode(tokenRes.data.id_token);
        email = payload.email;
        name = payload.name;
        googleId = payload.sub;
        picture = payload.picture;
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Google profile email missing." });
    }

    email = email.toLowerCase().trim();
    let user = await prisma.users.findUnique({ where: { email } });

    // Check referral code for new users
    let referrerUser = null;
    if (!user && referral_code_used) {
      referrerUser = await prisma.users.findUnique({
        where: { referral_code: referral_code_used.trim().toUpperCase() },
      });
    }

    // 1. Create or Update in MySQL
    if (!user) {
      const generatedRefCode = generateReferralCode(name || "USER");
      user = await prisma.users.create({
        data: {
          name: name || "Google User",
          email,
          role: "client",
          user_type: "student",
          profile_image_url: picture || null,
          referral_code: generatedRefCode,
          referred_by: referrerUser ? referrerUser.id : null,
          is_email_verified: true,
          is_active: true,
          last_login_at: new Date(),
        },
      });

      if (referrerUser) {
        try {
          const refSetting = await prisma.referral_settings.findFirst({
            where: { enabled: true },
          });
          await prisma.referrals.create({
            data: {
              referrer_id: referrerUser.id,
              referred_user_id: user.id,
              referral_code: referrerUser.referral_code || referral_code_used,
              discount_type: refSetting ? refSetting.discount_type : "percentage",
              discount_value: refSetting ? refSetting.discount_value : 10.0,
              status: "registered",
            },
          });
        } catch (refErr) {
          console.warn("Could not record referral tracking in Google login:", refErr.message);
        }
      }
    } else {
      const updateData = { last_login_at: new Date() };
      if (!user.is_email_verified) updateData.is_email_verified = true;
      if (!user.profile_image_url && picture) updateData.profile_image_url = picture;

      user = await prisma.users.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // 2. Link auth_accounts in MySQL
    if (googleId) {
      const existingAccount = await prisma.auth_accounts.findFirst({
        where: { provider: "google", provider_account_id: String(googleId) },
      });
      if (!existingAccount) {
        await prisma.auth_accounts.create({
          data: {
            user_id: user.id,
            provider: "google",
            provider_account_id: String(googleId),
            provider_email: email,
          },
        });
      }
    }

    // 3. Sync to MongoDB (userModel)
    let mongoUser = null;
    try {
      mongoUser = await userModel.findOne({ email });
      if (!mongoUser) {
        mongoUser = await userModel.create({
          username: user.name,
          email,
          verified: true,
          user_type: user.user_type || "student",
          role: user.role || "client",
          referral_code: user.referral_code,
        });
      } else if (!mongoUser.verified) {
        await userModel.updateOne({ email }, { verified: true });
      }
    } catch (mErr) {
      console.warn("MongoDB sync warning in Google login:", mErr.message);
    }

    // 4. Generate JWT tokens
    const tokenPayload = { id: user.id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = sha256(refreshToken);

    // 5. Save session in MySQL user_sessions
    await prisma.user_sessions.create({
      data: {
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        ip_address: req.ip || "",
        user_agent: req.headers["user-agent"] || "",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 6. Save session in MongoDB sessionModel
    try {
      if (mongoUser) {
        await sessionModel.create({
          user: mongoUser._id,
          refreshTokenHash,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        });
      }
    } catch (sErr) {
      // ignore
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        referral_code: user.referral_code,
        profile_image_url: user.profile_image_url,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ success: false, message: "Google authentication failed.", error: error.message });
  }
}

// ==========================================
// 9. GITHUB OAUTH
// ==========================================
export async function githubLogin(req, res) {
  try {
    const { code, referral_code_used } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "GitHub authorization code missing." });
    }

    // Exchange code for token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: config.GITHUB_CLIENT_ID,
        client_secret: config.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const ghAccessToken = tokenRes.data.access_token;
    if (!ghAccessToken) {
      return res.status(400).json({
        success: false,
        message: tokenRes.data.error_description || "Failed to obtain GitHub access token.",
      });
    }

    // Get GitHub profile
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${ghAccessToken}` },
    });
    const ghUser = userRes.data;

    // Get primary email
    let email = ghUser.email;
    if (!email) {
      try {
        const emailsRes = await axios.get("https://api.github.com/user/emails", {
          headers: { Authorization: `token ${ghAccessToken}` },
        });
        const primaryEmailObj = emailsRes.data.find((e) => e.primary && e.verified) || emailsRes.data[0];
        email = primaryEmailObj ? primaryEmailObj.email : `${ghUser.id}+github@devmatrix.local`;
      } catch (eErr) {
        email = `${ghUser.id}+github@devmatrix.local`;
      }
    }

    email = email.toLowerCase().trim();
    let user = await prisma.users.findUnique({ where: { email } });

    // Check referral code for new users
    let referrerUser = null;
    if (!user && referral_code_used) {
      referrerUser = await prisma.users.findUnique({
        where: { referral_code: referral_code_used.trim().toUpperCase() },
      });
    }

    // 1. Create or Update in MySQL
    if (!user) {
      const generatedRefCode = generateReferralCode(ghUser.login || "GHUB");
      user = await prisma.users.create({
        data: {
          name: ghUser.name || ghUser.login || "GitHub User",
          email,
          role: "client",
          user_type: "student",
          profile_image_url: ghUser.avatar_url || null,
          referral_code: generatedRefCode,
          referred_by: referrerUser ? referrerUser.id : null,
          is_email_verified: true,
          is_active: true,
          last_login_at: new Date(),
        },
      });

      if (referrerUser) {
        try {
          const refSetting = await prisma.referral_settings.findFirst({
            where: { enabled: true },
          });
          await prisma.referrals.create({
            data: {
              referrer_id: referrerUser.id,
              referred_user_id: user.id,
              referral_code: referrerUser.referral_code || referral_code_used,
              discount_type: refSetting ? refSetting.discount_type : "percentage",
              discount_value: refSetting ? refSetting.discount_value : 10.0,
              status: "registered",
            },
          });
        } catch (refErr) {
          console.warn("Could not record referral tracking in GitHub login:", refErr.message);
        }
      }
    } else {
      const updateData = { last_login_at: new Date() };
      if (!user.is_email_verified) updateData.is_email_verified = true;
      if (!user.profile_image_url && ghUser.avatar_url) updateData.profile_image_url = ghUser.avatar_url;

      user = await prisma.users.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // 2. Link auth_accounts in MySQL
    const existingAccount = await prisma.auth_accounts.findFirst({
      where: { provider: "github", provider_account_id: String(ghUser.id) },
    });
    if (!existingAccount) {
      await prisma.auth_accounts.create({
        data: {
          user_id: user.id,
          provider: "github",
          provider_account_id: String(ghUser.id),
          provider_email: email,
        },
      });
    }

    // 3. Sync to MongoDB (userModel)
    let mongoUser = null;
    try {
      mongoUser = await userModel.findOne({ email });
      if (!mongoUser) {
        mongoUser = await userModel.create({
          username: user.name,
          email,
          verified: true,
          user_type: user.user_type || "student",
          role: user.role || "client",
          referral_code: user.referral_code,
        });
      } else if (!mongoUser.verified) {
        await userModel.updateOne({ email }, { verified: true });
      }
    } catch (mErr) {
      console.warn("MongoDB sync warning in GitHub login:", mErr.message);
    }

    // 4. Generate JWT tokens
    const tokenPayload = { id: user.id.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const refreshTokenHash = sha256(refreshToken);

    // 5. Save session in MySQL user_sessions
    await prisma.user_sessions.create({
      data: {
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        ip_address: req.ip || "",
        user_agent: req.headers["user-agent"] || "",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 6. Save session in MongoDB sessionModel
    try {
      if (mongoUser) {
        await sessionModel.create({
          user: mongoUser._id,
          refreshTokenHash,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        });
      }
    } catch (sErr) {
      // ignore
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "GitHub login successful.",
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        referral_code: user.referral_code,
        profile_image_url: user.profile_image_url,
      },
      accessToken,
    });
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    return res.status(500).json({ success: false, message: "GitHub authentication failed.", error: error.message });
  }
}

// ==========================================
// 10. OAUTH CONFIG (Public client IDs for Frontend)
// ==========================================
export function getOAuthConfig(req, res) {
  return res.status(200).json({
    success: true,
    googleClientId: config.GOOGLE_CLIENT_ID || "",
    githubClientId: config.GITHUB_CLIENT_ID || "",
  });
}
