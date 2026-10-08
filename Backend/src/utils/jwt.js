import jwt from "jsonwebtoken";
import config from "../config/env.js";
import { SERVER_BOOT_ID } from "../config/serverInstance.js";

export const generateAccessToken = (payload) => {
  return jwt.sign({ ...payload, bootId: SERVER_BOOT_ID }, config.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, bootId: SERVER_BOOT_ID }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};
