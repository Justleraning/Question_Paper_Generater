const mongoose = require("mongoose");

const paperSchema = mongoose.Schema({
  paperId: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true },
  status: { type: String, enum: ["Pending", "Rejected", "Approved"], default: "Pending" },
  rejectionReason: { type: String, default: "" },
  approvalRequested: { type: Boolean, default: false },
  sections: [
    {
      subject: { type: String, required: true },
      questions: [
        {
          questionText: { type: String, required: true },
          options: { type: [String], required: true },
          correctAnswer: { type: String, required: true },
        },
      ],
    },
  ],
  answerSheet: [
    {
      questionText: { type: String, required: true },
      correctAnswer: { type: String, required: true },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Paper", paperSchema);
