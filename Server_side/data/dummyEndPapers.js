// Sample data for EndPapers collection
// Create this file at Server_side/data/dummyEndPapers.js

const mongoose = require('mongoose');

// Generate ObjectIds for references
const userIds = [
  new mongoose.Types.ObjectId(),
  new mongoose.Types.ObjectId()
];

module.exports = [
  {
    university: {
      name: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
      logoUrl: "/SJU.png"
    },
    examDetails: {
      course: "BSC",
      semester: "THIRD",
      semesterExamination: "DECEMBER 2023",
      examinationConducted: "2024",
      subjectCode: "BSC301",
      subjectName: "Data Structures",
      examTimings: "2 hours",
      maxMarks: "60",
      duration: "2"
    },
    metadata: {
      createdBy: userIds[0],
      status: 'draft',
      approvalHistory: []
    },
    paperStructure: {
      totalPages: 1,
      parts: [
        {
          partId: "A",
          partTitle: "PART-A",
          instructions: ["Answer all FIVE questions", "(2 X 5 = 10)"],
          marksFormat: "(2 X 5 = 10)",
          questions: [
            {
              questionId: "q1",
              questionNumber: 1,
              questionText: "Define data structures and its types.",
              hasImage: false,
              unit: 1,
              bloomLevel: "Remember L1",
              marks: 2,
              part: "A"
            },
            {
              questionId: "q2",
              questionNumber: 2,
              questionText: "List the applications of stack data structure.",
              hasImage: false,
              unit: 2,
              bloomLevel: "Remember L1",
              marks: 2,
              part: "A"
            }
          ]
        },
        {
          partId: "B",
          partTitle: "PART-B",
          instructions: ["Answer any FIVE questions", "(4 X 5 = 20)"],
          marksFormat: "(4 X 5 = 20)",
          questions: [
            {
              questionId: "q3",
              questionNumber: 3,
              questionText: "Explain the differences between array and linked list with examples.",
              hasImage: false,
              unit: 1,
              bloomLevel: "Apply L2",
              marks: 4,
              part: "B"
            },
            {
              questionId: "q4",
              questionNumber: 4,
              questionText: "Implement a queue using two stacks with examples.",
              hasImage: false,
              unit: 2,
              bloomLevel: "Apply L2",
              marks: 4,
              part: "B"
            }
          ]
        },
        {
          partId: "C",
          partTitle: "PART-C",
          instructions: ["Answer any THREE questions", "(10 X 3 = 30)"],
          marksFormat: "(10 X 3 = 30)",
          questions: [
            {
              questionId: "q5",
              questionNumber: 5,
              questionText: "Develop an algorithm for binary search tree traversal and analyze its time complexity.",
              hasImage: false,
              unit: 3,
              bloomLevel: "Evaluate L3",
              marks: 10,
              part: "C"
            },
            {
              questionId: "q6",
              questionNumber: 6,
              questionText: "Design and implement a graph representation and perform BFS and DFS traversals.",
              hasImage: false,
              unit: 4,
              bloomLevel: "Evaluate L3",
              marks: 10,
              part: "C"
            }
          ]
        }
      ]
    },
    layout: {
      paperSize: 'A4',
      marginTop: 20,
      marginRight: 15,
      marginBottom: 20,
      marginLeft: 15,
      headerHeight: 60,
      footerHeight: 20
    },
    renderHTML: "<div class='din8-a4-paper'>Sample paper content</div>",
    imageStates: {
      "er-diagram": {
        width: 300,
        height: 200,
        left: 0,
        top: 0
      }
    }
  },
  {
    university: {
      name: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
      logoUrl: "/SJU.png"
    },
    examDetails: {
      course: "BCA",
      semester: "FOURTH",
      semesterExamination: "JUNE 2024",
      examinationConducted: "2024",
      subjectCode: "BCA401",
      subjectName: "Database Management Systems",
      examTimings: "3 hours",
      maxMarks: "70",
      duration: "3"
    },
    metadata: {
      createdBy: userIds[1],
      status: 'published',
      approvalHistory: [
        {
          status: 'submitted',
          approvedBy: userIds[1],
          timestamp: new Date('2024-01-15'),
          comments: 'Submitted for approval'
        },
        {
          status: 'approved',
          approvedBy: userIds[0],
          timestamp: new Date('2024-01-18'),
          comments: 'Paper approved'
        }
      ]
    },
    paperStructure: {
      totalPages: 2,
      parts: [
        {
          partId: "A",
          partTitle: "PART-A",
          instructions: ["Answer all FIVE questions", "(2 X 5 = 10)"],
          marksFormat: "(2 X 5 = 10)",
          questions: [
            {
              questionId: "q7",
              questionNumber: 1,
              questionText: "Define DBMS and list its advantages.",
              hasImage: false,
              unit: 1,
              bloomLevel: "Remember L1",
              marks: 2,
              part: "A"
            },
            {
              questionId: "q8",
              questionNumber: 2,
              questionText: "What is normalization? List the normal forms.",
              hasImage: false,
              unit: 2,
              bloomLevel: "Remember L1",
              marks: 2,
              part: "A"
            }
          ]
        },
        {
          partId: "B",
          partTitle: "PART-B",
          instructions: ["Answer any FIVE questions", "(4 X 5 = 20)"],
          marksFormat: "(4 X 5 = 20)",
          questions: [
            {
              questionId: "q9",
              questionNumber: 3,
              questionText: "Explain the E-R model with suitable examples.",
              hasImage: true,
              imageUrl: "/images/er-diagram.png",
              imageState: {
                width: 300,
                height: 200,
                left: 0,
                top: 0
              },
              unit: 1,
              bloomLevel: "Apply L2",
              marks: 4,
              part: "B"
            },
            {
              questionId: "q10",
              questionNumber: 4,
              questionText: "Write SQL queries to create tables with constraints.",
              hasImage: false,
              unit: 3,
              bloomLevel: "Apply L2",
              marks: 4,
              part: "B"
            }
          ]
        },
        {
          partId: "C",
          partTitle: "PART-C",
          instructions: ["Answer any THREE questions", "(10 X 3 = 30)"],
          marksFormat: "(10 X 3 = 30)",
          questions: [
            {
              questionId: "q11",
              questionNumber: 5,
              questionText: "Design a complete database system for a library management with at least 5 tables. Include ER diagram, schema design, and sample queries.",
              hasImage: false,
              unit: 4,
              bloomLevel: "Evaluate L3",
              marks: 10,
              part: "C"
            },
            {
              questionId: "q12",
              questionNumber: 6,
              questionText: "Explain transaction management in DBMS. Implement ACID properties with real-world examples.",
              hasImage: false,
              unit: 5,
              bloomLevel: "Evaluate L3",
              marks: 10,
              part: "C"
            }
          ]
        }
      ]
    },
    layout: {
      paperSize: 'A4',
      marginTop: 20,
      marginRight: 15,
      marginBottom: 20,
      marginLeft: 15,
      headerHeight: 60,
      footerHeight: 20
    },
    renderHTML: "<div class='din8-a4-paper'>Sample DBMS paper content with multiple pages</div>",
    imageStates: {
      "er-diagram": {
        width: 300,
        height: 200,
        left: 0,
        top: 0
      }
    }
  }
];