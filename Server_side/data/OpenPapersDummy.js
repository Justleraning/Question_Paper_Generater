const mongoose = require('mongoose');

// Create ObjectIds for reference
const dummySubjectId = new mongoose.Types.ObjectId();
const dummyUserId = new mongoose.Types.ObjectId();

const dummyOpenPapers = [
  {
    title: "C# and .NET Framework MCQ Paper",
    subject: dummySubjectId,
    subjectName: "C# AND DOT NET FRAMEWORK",
    subjectCode: "CA 3222",
    course: "BCA",
    paperType: "Mid Sem",
    questions: [
      {
        text: "What is the base class for all classes in .NET?",
        options: ["A. Object", "B. System", "C. Base", "D. Root"],
        correctOption: "A",
        marks: 1,
      },
      {
        text: "Which of the following is NOT a valid C# data type?",
        options: ["A. int", "B. char", "C. float", "D. variant"],
        correctOption: "D",
        marks: 1,
      },
      {
        text: "What is the access modifier that makes a class member visible only within the containing class?",
        options: ["A. public", "B. private", "C. protected", "D. internal"],
        correctOption: "B",
        marks: 1,
      }
    ],
    totalMarks: 20,
    createdBy: dummyUserId,
    status: "Draft",
    paperLayout: {
      header: true,
      logo: true,
      registrationBox: true,
      university: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
      course: "BCA",
      examType: "SEMESTER EXAMINATION",
      sessionDate: new Date(),
      timeAllowed: "1 Hours",
    },
  },
  {
    title: "Database Management Systems MCQ Paper",
    subject: new mongoose.Types.ObjectId(),
    subjectName: "DATABASE MANAGEMENT SYSTEMS",
    subjectCode: "CA 3221",
    course: "BCA",
    paperType: "End Sem",
    questions: [
      {
        text: "Which normal form deals with multi-valued dependencies?",
        options: ["A. 1NF", "B. 2NF", "C. 3NF", "D. 4NF"],
        correctOption: "D",
        marks: 1,
      },
      {
        text: "What is the primary key in a relational database?",
        options: [
          "A. A key that can accept NULL values",
          "B. A unique identifier for a record",
          "C. A foreign key reference",
          "D. A composite key only"
        ],
        correctOption: "B",
        marks: 1,
      }
    ],
    totalMarks: 30,
    createdBy: dummyUserId,
    status: "Published",
    paperLayout: {
      header: true,
      logo: true,
      registrationBox: true,
      university: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
      course: "BCA",
      examType: "SEMESTER EXAMINATION",
      sessionDate: new Date(),
      timeAllowed: "2 Hours",
    },
  }
];

module.exports = dummyOpenPapers;