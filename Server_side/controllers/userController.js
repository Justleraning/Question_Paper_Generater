// userController.js - Fixed Version
const User = require("../models/User");
const { hashPassword } = require("../config/bcrypt");

const addUser = async (req, res) => {
  const { username, fullName, role } = req.body;

  try {
    // ✅ Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // ✅ Validate Role Assignment
    let assignedRole;
    if (req.user.role === "SuperAdmin") {
      assignedRole = role === "Admin" ? "Admin" : "Teacher"; // SuperAdmin can assign both
    } else if (req.user.role === "Admin") {
      assignedRole = "Teacher"; // Admins can ONLY add Teachers
    } else {
      return res.status(403).json({ message: "Unauthorized to add users" });
    }

    // ✅ Create new user
    const hashedPassword = await hashPassword(username); // Default password = username
    const newUser = new User({ username, fullName, password: hashedPassword, role: assignedRole });

    await newUser.save();
    res.status(201).json({ message: `${assignedRole} added successfully`, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const removeUser = async (req, res) => {
  const { id } = req.params;

  try {
    const userToRemove = await User.findById(id);
    if (!userToRemove) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Prevent SuperAdmins from removing themselves
    if (req.user._id.toString() === id) {
      return res.status(403).json({ message: "SuperAdmin cannot remove themselves!" });
    }

    // ✅ Prevent unauthorized removals
    if (
      (req.user.role === "Admin" && userToRemove.role !== "Teacher") || 
      (req.user.role === "SuperAdmin" && userToRemove.role !== "Admin")
    ) {
      return res.status(403).json({ message: "Unauthorized to remove this user" });
    }

    // ✅ Check if the removed user is currently logged in
    const isCurrentUser = req.user._id.toString() === id;

    console.log(`🚨 Removing User: ${userToRemove.username}, forceLogout: ${isCurrentUser}`);

    // ✅ Remove user from database
    await User.findByIdAndDelete(id);

    // ✅ Return forceLogout flag for frontend pop-up
    res.status(200).json({ message: "User removed successfully", forceLogout: isCurrentUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "SuperAdmin") {
      filter = { role: "Admin" }; // ✅ SuperAdmin should only see Admins
    } else if (req.user.role === "Admin") {
      filter = { role: "Teacher" }; // ✅ Admin should only see Teachers
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const users = await User.find(filter).select("fullName username role"); // Fetch required fields only
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addUser, removeUser, getUsers };
