const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  course: { type: String, required: true },
  subject: { type: String, required: true, enum: ["Logical Reasoning", "Quantitative Aptitude", "English", "Custom"] },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
