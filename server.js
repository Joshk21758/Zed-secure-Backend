import express from "express";
const userRoutes = require("./routes/userRoutes");
const smsRoutes = require("./routes/smsRoutes");
import cors from "cors";

// Import Database instance
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
db.connect()
  .then(() => console.log(" Database connected successfully"))
  .catch((err) => console.error(" Database connection error:", err));

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
