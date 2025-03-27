const express = require("express");
const {
  login,
  requestPasswordReset,
  viewResetRequests,
  resetPassword,
  changePasswordBeforeLogin,
  changePasswordAfterLogin,
  loginLimiter,
} = require("../controllers/authController");

const User = require("../models/User");
const { protect, adminOnly } = require("../middlewares/authMiddleware");


const router = express.Router();




router.post("/login", loginLimiter,login);
router.post("/request-reset", requestPasswordReset);
router.get("/reset-requests", protect, adminOnly, viewResetRequests);
router.patch("/reset-password", protect, adminOnly, resetPassword);
router.post("/change-password-before-login", changePasswordBeforeLogin);
router.patch("/change-password", protect, changePasswordAfterLogin);




router.get("/verify", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // ✅ Fetch user again to ensure they still exist
    const userExists = await User.findById(req.user._id);

    if (!userExists) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user: userExists });
  } catch (error) {
    console.error("❌ Error verifying user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
