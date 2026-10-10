import express from "express";
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = express.Router();

// register route
router.post("/register", async (req, res) => {
  try {
    // extract form fields
    const { name, email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(500).json({ message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user to DB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({
      message: "Sucessfully registered user",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to register user" });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    // Extract form fields
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate json web token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      },
    );
    res
      .status(200)
      .json({ message: "Logged in successfully!", token, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Failed to Login user" });
  }
});

// Logout route
router.post("/logout", async (req, res) => {
  res
    .status(200)
    .json({ message: "Logout successful. Delete toekn from client storage" });
});
export default router;
