const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject", // Reference to Subject model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Unit", unitSchema);
