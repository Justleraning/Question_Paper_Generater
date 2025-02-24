const mongoose = require("mongoose");

const finalPaperSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject", // Reference to the Subject model
    required: true,
  },
  totalMarks: {
    type: Number,
    required: true,
    enum: [20, 30], // Ensure the marks are either 20 or 30
  },
  units: [
    {
      unitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit", // Reference to the Unit model
        required: true,
      },
      unitName: {
        type: String,
        required: true,
      },
    },
  ],
  questions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question", // Reference to the Question model
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
          required: true,
        },
      ],
      correctOption: {
        type: String,
        required: true,
      },
      isImage: {
        type: Boolean,
        default: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FinalPaper", finalPaperSchema);
