const mongoose = require("mongoose");

const questionPaperSchema = new mongoose.Schema({
  semester: String,
  subject: String,
  units: [String],
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }] // ✅ Reference to Questions collection
});

module.exports = mongoose.model("QuestionPaper_midsem", questionPaperSchema);
