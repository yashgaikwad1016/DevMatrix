import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    ip: String,
    userAgent: String,
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const sessionModel = mongoose.models.sessions || mongoose.model("sessions", sessionSchema);

export default sessionModel;
