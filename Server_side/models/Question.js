const mongoose = require("mongoose");

const questionSchema = mongoose.Schema({
  courseName: { type: String, required: true }, 
  subject: { type: String, required: true },
  question: { type: String, required: true }, 
  options: [
    {
      type: { type: String, required: true },
      value: { type: String, required: true },
    },
  ],
  correctOption: { type: String, required: true }, 
  index: { type: Number, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
