import crypto from "crypto";
import bcrypt from "bcryptjs";

export const sha256 = (data) => {
  return crypto.createHash("sha256").update(String(data)).digest("hex");
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  // Support both SHA-256 (from jwt-auth-backend-system) and bcrypt
  if (hash.length === 64) {
    return sha256(password) === hash;
  }
  return await bcrypt.compare(password, hash);
};
