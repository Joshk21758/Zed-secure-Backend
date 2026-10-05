import express from "express";
import userRoutes from "./routes/userRoutes.js";
import mongoose from "mongoose";
import smsRoutes from "./routes/smsRoutes.js";
import cors from "cors";

const app = express();
const MONGO_URI = process.env.DB_URI;
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
mongoose
  .connect(MONGO_URI, { dbName: "zed_secure" })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

// Mount REST API Routes
app.use("/api/users", userRoutes);
app.use("/api/sms", smsRoutes);

// Health Check Endpoint
app.get("/", (req, res) => {
  res.send("Spam detector backend running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
