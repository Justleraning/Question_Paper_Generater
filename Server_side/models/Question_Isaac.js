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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent Overwriting the Model
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

module.exports = Question;
