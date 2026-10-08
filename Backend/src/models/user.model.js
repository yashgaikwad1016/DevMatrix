import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    mobile: String,
    college: String,
    university: String,
    user_type: {
      type: String,
      enum: ["student", "employee", "other"],
      default: "student",
    },
    role: {
      type: String,
      enum: ["client", "admin", "developer"],
      default: "client",
    },
    referral_code: String,
  },
  { timestamps: true }
);

const userModel = mongoose.models.users || mongoose.model("users", userSchema);

export default userModel;
