const mongoose = require("mongoose");

// Replace these ObjectIds with real ones from your database
const teacherPoojaId = new mongoose.Types.ObjectId("65e2d5bac3af6708245c9f5d");
const teacherSelwynId = new mongoose.Types.ObjectId("65e2d5bac3af6708245c9f5e");

const papers = [
  {
    paperId: "P001",
    course: "B.Sc. Computer Science",
    createdBy: teacherPoojaId, // ✅ Use ObjectId instead of string
    status: "Pending",
    sections: [
      {
        subject: "Logical Reasoning",
        questions: [
          {
            questionText: "What comes next in the sequence: 2, 4, 8, 16?",
            options: ["18", "20", "32", "64"],
            correctAnswer: "32",
          },
        ],
      },
      {
        subject: "Quantitative Aptitude",
        questions: [
          {
            questionText: "What is the square root of 144?",
            options: ["10", "12", "14", "16"],
            correctAnswer: "12",
          },
        ],
      },
      {
        subject: "English",
        questions: [
          {
            questionText: "Choose the synonym of 'Abundant'.",
            options: ["Scarce", "Plentiful", "Rare", "Meager"],
            correctAnswer: "Plentiful",
          },
        ],
      },
      {
        subject: "Custom",
        questions: [
          {
            questionText: "What is the time complexity of binary search?",
            options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            correctAnswer: "O(log n)",
          },
        ],
      },
    ],
  },
  {
    paperId: "P002",
    course: "B.Sc. Computer Science",
    createdBy: teacherSelwynId, // ✅ Use ObjectId instead of string
    status: "Rejected",
    rejectionReason: "Incomplete sections for English and Custom.",
    sections: [
      {
        subject: "Logical Reasoning",
        questions: [
          {
            questionText: "If A = 1, B = 2, C = 3, what is Z?",
            options: ["24", "25", "26", "27"],
            correctAnswer: "26",
          },
        ],
      },
      {
        subject: "Quantitative Aptitude",
        questions: [
          {
            questionText: "What is 25% of 200?",
            options: ["25", "40", "50", "60"],
            correctAnswer: "50",
          },
        ],
      },
    ],
  },
];

module.exports = papers;
