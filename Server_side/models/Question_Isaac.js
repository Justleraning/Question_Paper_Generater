const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length === 4,
        message: "Options must contain exactly 4 elements.",
      },
    },
    correctOption: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return ["A", "B", "C", "D"].includes(v);
        },
        message: "Correct option must be one of A, B, C, or D.",
      },
    },
    index: {
      type: Number,
      required: true,
    },
  },
  { collection: "questions_isaac" } // ✅ Change collection name here
);

const QuestionIsaac =
  mongoose.models.QuestionIsaac ||
  mongoose.model("QuestionIsaac", questionSchema);

module.exports = QuestionIsaac;
