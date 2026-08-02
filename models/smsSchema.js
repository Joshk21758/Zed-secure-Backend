import mongoose from "mongoose";

const SmsLogSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    analysis: {
      is_scam: { type: Boolean, required: true },
      confidence_score: { type: Number, required: true },
      category: {
        type: String,
        enum: [
          "PHISHING",
          "PROMOTIONAL",
          "PERSONAL",
          "MOBILE_MONEY_FRAUD",
          "LEGITIMATE",
        ],
        required: true,
      },
      reason: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SmsLog", SmsLogSchema);
