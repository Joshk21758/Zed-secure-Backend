import express from "express";
import axios from "axios";
import SmsLog from "../models/smsSchema.js";
const router = express.Router();
const MODEL = "@cf/meta/llama-3-8b-instruct";

// POST /api/v1/sms/analyze - Intercept
router.post("/analyze", async (req, res) => {
  try {
    const { sender, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message body is required." });
    }

    const systemPrompt = `You are an automated SMS scam and phishing detector. 
Analyze the provided SMS message and classify it.
Respond STRICTLY with a valid JSON object matching this schema:
{
  "is_scam": true/false,
  "confidence_score": 0.0 to 1.0,
  "category": "PHISHING" | "PROMOTIONAL" | "PERSONAL" | "MOBILE_MONEY_FRAUD" | "LEGITIMATE",
  "reason": "Short one-sentence explanation"
}`;

    const cloudflareResponse = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run${MODEL}`,
      {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Sender: ${sender}\nMessage: "${message}"` },
        ],
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    const rawResponse = cloudflareResponse.data.result.response.trim();

    let analysis;
    try {
      analysis = JSON.parse(rawResponse);
    } catch {
      const cleanedJson = rawResponse.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(cleanedJson);
    }

    // Save to MongoDB
    const savedLog = await SmsLog.create({
      sender,
      message,
      analysis,
    });

    console.log(`[Mongo Saved] Sender: ${sender} | Scam: ${analysis.is_scam}`);

    return res.status(200).json({
      success: true,
      log: savedLog,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to evaluate or persist message.",
    });
  }
});

// GET /api/v1/sms/analytics - Fetch aggregate metrics from MongoDB
router.get("/analytics", async (req, res) => {
  try {
    const totalProcessed = await SmsLog.countDocuments();
    const totalThreats = await SmsLog.countDocuments({
      "analysis.is_scam": true,
    });
    const safeMessages = totalProcessed - totalThreats;

    // Aggregate category counts using Mongo Pipeline
    const categoryCounts = await SmsLog.aggregate([
      { $match: { "analysis.is_scam": true } },
      { $group: { _id: "$analysis.category", count: { $sum: 1 } } },
    ]);

    // Format category output
    const categories = {
      PHISHING: 0,
      MOBILE_MONEY_FRAUD: 0,
      PROMOTIONAL: 0,
      PERSONAL: 0,
    };

    categoryCounts.forEach((item) => {
      if (categories[item._id] !== undefined) {
        categories[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalProcessed,
        totalThreats,
        safeMessages,
        threatRatio:
          totalProcessed > 0 ?
            ((totalThreats / totalProcessed) * 100).toFixed(0)
          : 0,
        categories,
      },
    });
  } catch (error) {
    console.error("Analytics aggregation error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Failed to generate metrics." });
  }
});

export default router;
