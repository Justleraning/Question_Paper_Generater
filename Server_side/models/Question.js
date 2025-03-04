const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  questionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  courseName: { type: String, required: true }, 
  subject: { type: String, required: true },
  question: { type: String, required: true }, 
  options: [
    {
      type: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  correctOption: { 
    type: Number,  // Changed from String to Number
    required: true 
  }, 
  // Keep index for backward compatibility or remove if not needed anymore
  index: { type: Number, required: false },
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);