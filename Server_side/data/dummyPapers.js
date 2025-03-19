const mongoose = require("mongoose");

// Replace these ObjectIds with real ones from your database
const teacherPoojaId = new mongoose.Types.ObjectId("65e2d5bac3af6708245c9f5d");
const teacherSelwynId = new mongoose.Types.ObjectId("65e2d5bac3af6708245c9f5e");

const papers = [
  {
    courseName: "B.Sc. Computer Science",
    customSubjectName: "",
    totalMarks: 40,
    examTime: 1,
    date: new Date().toLocaleDateString(),
    createdBy: teacherPoojaId,
    questions: [
      {
        subject: "Logical Reasoning",
        question: "What comes next in the sequence: 2, 4, 8, 16?",
        options: [
          { type: "Text", value: "18" },
          { type: "Text", value: "20" },
          { type: "Text", value: "32" },
          { type: "Text", value: "64" }
        ],
        correctOption: 2,
        index: 1,
        marks: 1
      },
      {
        subject: "Quantitative Problem Solving",
        question: "What is the square root of 144?",
        options: [
          { type: "Text", value: "10" },
          { type: "Text", value: "12" },
          { type: "Text", value: "14" },
          { type: "Text", value: "16" }
        ],
        correctOption: 1,
        index: 2,
        marks: 1
      },
      {
        subject: "English",
        question: "Choose the synonym of 'Abundant'.",
        options: [
          { type: "Text", value: "Scarce" },
          { type: "Text", value: "Plentiful" },
          { type: "Text", value: "Rare" },
          { type: "Text", value: "Meager" }
        ],
        correctOption: 1,
        index: 3,
        marks: 1
      },
      {
        subject: "Custom",
        question: "What is the time complexity of binary search?",
        options: [
          { type: "Text", value: "O(n)" },
          { type: "Text", value: "O(log n)" },
          { type: "Text", value: "O(n^2)" },
          { type: "Text", value: "O(1)" }
        ],
        correctOption: 1,
        index: 4,
        marks: 1
      }
    ]
  },
  {
    courseName: "B.Sc. Computer Science",
    customSubjectName: "",
    totalMarks: 40,
    examTime: 1,
    date: new Date().toLocaleDateString(),
    createdBy: teacherSelwynId,
    questions: [
      {
        subject: "Logical Reasoning",
        question: "If A = 1, B = 2, C = 3, what is Z?",
        options: [
          { type: "Text", value: "24" },
          { type: "Text", value: "25" },
          { type: "Text", value: "26" },
          { type: "Text", value: "27" }
        ],
        correctOption: 2,
        index: 1,
        marks: 1
      },
      {
        subject: "Quantitative Problem Solving",
        question: "What is 25% of 200?",
        options: [
          { type: "Text", value: "25" },
          { type: "Text", value: "40" },
          { type: "Text", value: "50" },
          { type: "Text", value: "60" }
        ],
        correctOption: 2,
        index: 2,
        marks: 1
      }
    ]
  }
];

module.exports = papers;