const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const formData = req.body;
  console.log("received data for signup: ", formData);
  try {
    const existing = await User.findOne({ email: formData.email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formData.password, salt);

    formData.password = hashedPassword;

    const user = new User(formData);
    await user.save();

    res.status(201).json({ message: "registration successful" });
  } catch (err) {
    console.log("error: ", err);
    res.status(500).json({ message: "Internal server error " });
  }
});

router.post("/login", async (req, res) => {
  const formData = req.body;
  console.log("received data for login: ", formData);
  try {
    const user = await User.findOne({ email: formData.email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const passwordsMatch = await bcrypt.compare(
      formData.password,
      user.password
    );
    if (!passwordsMatch)
      return res.status(400).json({ message: "Incorrect password" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    const { password, __v, ...userData } = user.toObject(); // Exclude password and from the response
    return res.status(200).json({
      message: "login successful",
      token,
      user: userData,
    });
  } catch (err) {
    console.log("error: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", async (req, res) => {
  console.log("received data for logout: ", req.body);
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
    });
    return res.status(200).json({ message: "logout successful" });
  } catch (err) {
    console.log("error: ", err);
    res.status(500).json({ message: "Internal server error " });
  }
});
module.exports = router;
