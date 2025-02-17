const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Teacher", "Admin", "SuperAdmin"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
