const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],  // Array of Strings
    required: true,
    validate: {
      validator: (arr) => arr.length === 4, // Ensure exactly 4 options
      message: "Options must contain exactly 4 elements.",
    },
  },
  correctOption: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return ["A", "B", "C", "D"].includes(v); // Ensure valid option labels
      },
      message: "Correct option must be one of A, B, C, or D.",
    },
  },
  isImage: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent Overwriting the Model
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

module.exports = Question;
