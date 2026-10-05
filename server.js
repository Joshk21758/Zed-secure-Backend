import express from "express";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import smsRoutes from "./routes/smsRoutes.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

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
