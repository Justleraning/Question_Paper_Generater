const mongoose = require("mongoose");

const OpenPapersSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Paper title is required"],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    subjectName: {
      type: String,
      required: [true, "Subject name is required"],
    },
    subjectCode: {
      type: String,
      default: "",
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      default: "BCA",
    },
    paperType: {
      type: String,
      enum: ["Mid Sem", "End Sem", "Internal Assessment"],
      required: [true, "Paper type is required"],
    },
    questions: [
      {
        text: {
          type: String,
          required: [true, "Question text is required"],
        },
        options: {
          type: mongoose.Schema.Types.Mixed,
          required: [true, "Options are required"],
        },
        correctOption: {
          type: String,
          required: [true, "Correct option is required"],
        },
        marks: {
          type: Number,
          required: [true, "Marks are required"],
          default: 1,
        },
      },
    ],
    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    paperLayout: {
      type: Object,
      default: {
        header: true,
        logo: true,
        registrationBox: true,
        university: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
        course: "BCA",
        examType: "SEMESTER EXAMINATION",
        sessionDate: Date.now(),
        timeAllowed: "1 Hours",
      },
    },
    htmlSnapshot: {
      type: String, // For storing HTML representation
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OpenPapers", OpenPapersSchema);