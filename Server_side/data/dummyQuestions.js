const questions = [
  {
    courseName: "Mathematics",
    subject: "Algebra",
    question: "What is 2 + 2?",
    options: [
      { type: "string", value: "1" },
      { type: "string", value: "2" },
      { type: "string", value: "3" },
      { type: "string", value: "4" }, // Correct answer
    ],
    correctOption: "4", // This should match one of the `value`s above
    index: 1,
  },
  {
    courseName: "Science",
    subject: "Astronomy",
    question: "Which planet is known as the Red Planet?",
    options: [
      { type: "string", value: "Earth" },
      { type: "string", value: "Mars" }, // Correct answer
      { type: "string", value: "Jupiter" },
      { type: "string", value: "Venus" },
    ],
    correctOption: "Mars",
    index: 2,
  },
];

module.exports = questions;
