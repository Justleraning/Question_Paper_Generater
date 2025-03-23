const mongoose = require("mongoose");

const resetRequestSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    role: { type: String }, // Add this field
    status: { type: String, default: "Pending", enum: ["Pending", "Accepted", "Rejected"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResetRequest", resetRequestSchema);