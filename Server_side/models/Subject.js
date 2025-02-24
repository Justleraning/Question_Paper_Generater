const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true, // ✅ Ensure unique case-insensitive name
    lowercase: true // ✅ Store names in lowercase
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // ✅ Store codes in uppercase
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

module.exports = mongoose.model("Subject", subjectSchema);
