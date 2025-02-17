const questions = [
    // Logical Reasoning (15 Questions)
    {
      course: "B.Sc. Computer Science",
      subject: "Logical Reasoning",
      questionText: "What comes next in the sequence: 2, 4, 8, 16?",
      options: ["18", "20", "32", "64"],
      correctAnswer: "32",
    },
    {
      course: "B.Sc. Computer Science",
      subject: "Logical Reasoning",
      questionText: "If A = 1, B = 2, C = 3, what is Z?",
      options: ["24", "25", "26", "27"],
      correctAnswer: "26",
    },
    // Add 13 more LR questions...
    {
      course: "B.Sc. Computer Science",
      subject: "Logical Reasoning",
      questionText: "What is the odd one out: Apple, Orange, Car, Banana?",
      options: ["Apple", "Car", "Banana", "Orange"],
      correctAnswer: "Car",
    },
  
    // Quantitative Aptitude (15 Questions)
    {
      course: "B.Sc. Computer Science",
      subject: "Quantitative Aptitude",
      questionText: "What is the square root of 144?",
      options: ["10", "12", "14", "16"],
      correctAnswer: "12",
    },
    {
      course: "B.Sc. Computer Science",
      subject: "Quantitative Aptitude",
      questionText: "What is 25% of 200?",
      options: ["25", "40", "50", "60"],
      correctAnswer: "50",
    },
    // Add 13 more QP questions...
    {
      course: "B.Sc. Computer Science",
      subject: "Quantitative Aptitude",
      questionText: "A train travels 240 km in 3 hours. What is its speed?",
      options: ["60 km/hr", "80 km/hr", "100 km/hr", "120 km/hr"],
      correctAnswer: "80 km/hr",
    },
  
    // English (10 Questions)
    {
      course: "B.Sc. Computer Science",
      subject: "English",
      questionText: "Choose the synonym of 'Abundant'.",
      options: ["Scarce", "Plentiful", "Rare", "Meager"],
      correctAnswer: "Plentiful",
    },
    {
      course: "B.Sc. Computer Science",
      subject: "English",
      questionText: "Which sentence is grammatically correct?",
      options: [
        "He don't like pizza.",
        "She doesn't enjoys running.",
        "They doesn't go to school.",
        "I don't know the answer.",
      ],
      correctAnswer: "I don't know the answer.",
    },
    // Add 8 more English questions...
  
    // Custom Subject (10 Questions)
    {
      course: "B.Sc. Computer Science",
      subject: "Custom",
      questionText: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      correctAnswer: "O(log n)",
    },
    {
      course: "B.Sc. Computer Science",
      subject: "Custom",
      questionText: "What is the result of 10 + 20 * 30?",
      options: ["600", "900", "310", "1200"],
      correctAnswer: "610",
    },
    // Add 8 more Custom questions...
  
    // Extra Questions (20 Questions for Customization/Expansion)
    {
      course: "B.Sc. Economics",
      subject: "Logical Reasoning",
      questionText: "If all squares are rectangles, are all rectangles squares?",
      options: ["Yes", "No", "Sometimes", "Cannot Determine"],
      correctAnswer: "No",
    },
    {
      course: "B.Sc. Economics",
      subject: "Quantitative Aptitude",
      questionText: "What is the value of π (pi) up to 2 decimal places?",
      options: ["3.14", "3.15", "3.13", "3.16"],
      correctAnswer: "3.14",
    },
    // Add 18 more extra questions...
  ];
  
  module.exports = questions;
  