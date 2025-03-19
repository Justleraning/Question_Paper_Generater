const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Middleware: Protect Routes (Ensures Authentication)
const protect = async (req, res, next) => {
  console.log("🔍 Protect Middleware Called");

  const token = req.headers.authorization?.split(" ")[1];
  console.log("📌 Token Received:", token);

  if (!token) {
    console.log("❌ No token found in request headers.");
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Decoded:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ User not found in database. Triggering forced logout...");
      return res.status(401).json({ message: "User removed, logging out" });
    }

    req.user = user;
    console.log("👤 Authenticated User:", req.user);

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    res.status(401).json({ 
      message: "Not authorized, invalid token", 
      forceLogout: true 
    });
  }
};


// ✅ Middleware: Admin Access Only (SuperAdmin & Admin)
const adminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== "Admin" && req.user.role !== "SuperAdmin")) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// ✅ Middleware: Super Admin Access Only
const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "SuperAdmin") {
    console.warn("🚨 Unauthorized: SuperAdmin access required!");
    return res.status(403).json({ message: "SuperAdmin access required" });
  }
  next();
};

// ✅ Middleware: Prevent Unauthorized Removals (Used in userRoutes.js)
const preventUnauthorizedRemoval = async (req, res, next) => {
  const { id } = req.params;
  const userToRemove = await User.findById(id);

  if (!userToRemove) {
    return res.status(404).json({ message: "User not found" });
  }

  // ✅ SuperAdmins can remove Admins, Admins can remove Teachers
  if (
    (req.user.role === "Admin" && userToRemove.role !== "Teacher") || 
    (req.user.role === "SuperAdmin" && userToRemove.role !== "Admin")
  ) {
    console.warn("❌ Unauthorized attempt to remove a user:", req.user.role, "tried to remove", userToRemove.role);
    return res.status(403).json({ message: "Unauthorized to remove this user" });
  }

  next();
};

module.exports = { protect, adminOnly, superAdminOnly, preventUnauthorizedRemoval };
