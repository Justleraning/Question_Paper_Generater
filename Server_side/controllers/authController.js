const User = require("../models/User");
const ResetRequest = require("../models/ResetRequest");
const { hashPassword, comparePassword } = require("../config/bcrypt");
const generateToken = require("../config/jwt");
const bcrypt = require("bcryptjs");
const rateLimit = require('express-rate-limit');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`🔍 Login Attempt: Username(${username})`);

    const user = await User.findOne({ username });
    if (!user) {
      console.warn("❌ User not found:", username);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("✅ User Found:", user);

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("🔄 Comparing passwords:", password, user.password);

    if (!passwordMatch) {
      console.warn("❌ Password does not match");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = generateToken(user._id, user.role);
  

    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      token: token,
    });
  } catch (error) {
    console.error("❌ Server Error during login:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const requestPasswordReset = async (req, res) => {
  const { username, fullName } = req.body;

  if (!username || !fullName) {
    return res.status(400).json({ message: "Username and Full Name required" });
  }

  try {
    const user = await User.findOne({ username, fullName });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "SuperAdmin") {
      return res.status(403).json({ message: "SuperAdmin must contact support" });
    }

    const existingRequest = await ResetRequest.findOne({ username });
    if (existingRequest) {
      return res.status(400).json({ message: "Reset request already submitted" });
    }

    // Save the user's role in the reset request
    await ResetRequest.create({ 
      username, 
      fullName, 
      role: user.role // Include the role
    });

    res.status(201).json({ message: "Reset request submitted" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const viewResetRequests = async (req, res) => {
  try {
    const userRole = req.user.role;

    let requests;
    if (userRole === "SuperAdmin") {
      requests = await ResetRequest.find({ role: "Admin" });
    } else if (userRole === "Admin") {
      requests = await ResetRequest.find({ role: "Teacher" });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await hashPassword(username);
    await user.save();

    await ResetRequest.findOneAndDelete({ username });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Change Password (User)
const changePasswordBeforeLogin = async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    // Hash New Password
    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Password changed successfully! You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Change Password After Login
const changePasswordAfterLogin = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate Current Password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    // Hash New Password
    user.password = await hashPassword(newPassword);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: "Too many login attempts. Try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { login, requestPasswordReset, viewResetRequests, resetPassword, changePasswordAfterLogin, changePasswordBeforeLogin,loginLimiter };
