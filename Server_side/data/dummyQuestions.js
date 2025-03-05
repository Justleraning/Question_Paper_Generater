const questions = [
  {
    questionId: "q1", // Added questionId
    courseName: "Mathematics",
    subject: "Algebra",
    question: "What is 2 + 2?",
    options: [
      { type: "string", value: "1" },
      { type: "string", value: "2" },
      { type: "string", value: "3" },
      { type: "string", value: "4" }, // Correct answer
    ],
    correctOption: 3, // Changed from String to Number (0-based index)
    index: 1,
  },
  {
    questionId: "q2", // Added questionId
    courseName: "Science",
    subject: "Astronomy",
    question: "Which planet is known as the Red Planet?",
    options: [
      { type: "string", value: "Earth" },
      { type: "string", value: "Mars" }, // Correct answer
      { type: "string", value: "Jupiter" },
      { type: "string", value: "Venus" },
    ],
    correctOption: 1, // Changed from String to Number (0-based index)
    index: 2,
  },
];

module.exports = questions;