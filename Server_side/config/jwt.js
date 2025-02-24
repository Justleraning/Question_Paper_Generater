require("dotenv").config(); // Explicitly load .env file

const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("🚨 Missing JWT_SECRET in environment variables!");
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

module.exports = generateToken;
