import express from "express";
const router = express.Router();
import User from "../models/userSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//register route
router.post("/register", async (req, res) => {
  try {
    //extract form fields
    const { name, email, password } = req.body;

    //check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(500).json({ message: "User already exists" });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //save user to DB
    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Sucessfully registered user",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to register user" });
  }
});

//login route
router.post("/login", async (req, res) => {
  try {
    //Extract form fields
    const { email, password } = req.body;
    //find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    // Generate json web token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.status(200).json({ message: "Logged in successfully!", token });
  } catch (err) {
    res.status(500).json({ message: "Failed to Login user" });
  }
});

//Logout route
router.post("/logout", async (req, res) => {
  // destroy jwt
  res
    .status(200)
    .json({ message: "Logout successful. Delete toekn from client storage" });
});

export default router;
