import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import config from "./env.js";

// Fix BigInt serialization for Prisma JSON responses
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const prisma = new PrismaClient({
  log: config.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export const connectDatabases = async () => {
  try {
    // 1. Connect MySQL via Prisma
    await prisma.$connect();
    console.log("Connected to MySQL (Prisma) successfully!");

    // 2. Connect MongoDB via Mongoose (for jwt-auth-backend-system compatibility)
    if (config.MONGODB_URI) {
      await mongoose.connect(config.MONGODB_URI);
      console.log("Connected to MongoDB successfully!");
    }
  } catch (error) {
    console.error("Database connection failure:", error);
    process.exit(1);
  }
};

export default { prisma, connectDatabases };
