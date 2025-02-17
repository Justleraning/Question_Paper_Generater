// userRoutes.js - Fixed Version
const express = require("express");
const { addUser, removeUser, getUsers } = require("../controllers/userController");
const { protect, adminOnly, superAdminOnly, preventUnauthorizedRemoval } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/add", protect, adminOnly, addUser);
router.delete("/remove/:id", protect, preventUnauthorizedRemoval, removeUser); // ✅ Fixed permissions
router.get("/", protect, getUsers);

module.exports = router;
