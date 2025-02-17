const Paper = require("../models/Paper");
const Question = require("../models/Question");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ✅ 📌 Create a New Paper (Teacher)
const createPaper = async (req, res) => {
  const { course, paperId } = req.body;

  try {
    // Fetch 70 questions but select 50
    const questionPool = {
      LogicalReasoning: await Question.find({ course, subject: "Logical Reasoning" }).limit(15),
      QuantitativeAptitude: await Question.find({ course, subject: "Quantitative Aptitude" }).limit(15),
      English: await Question.find({ course, subject: "English" }).limit(10),
      Custom: await Question.find({ course, subject: "Custom" }).limit(10),
    };

    // Structure selected questions
    const selectedQuestions = [];
    const answerSheet = [];

    for (const subject in questionPool) {
      selectedQuestions.push({
        subject,
        questions: questionPool[subject].map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      });

      answerSheet.push(...questionPool[subject].map(q => ({
        questionText: q.questionText,
        correctAnswer: q.correctAnswer,
      })));
    }

    // Save the paper
    const newPaper = new Paper({
      paperId,
      course,
      createdBy: req.user.id,
      sections: selectedQuestions,
      answerSheet,
    });

    await newPaper.save();
    res.status(201).json({ message: "Paper created successfully", paperId });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
const getMyPapers = async (req, res) => {
  try {
    if (!req.user) {
      console.error("❌ Error: User is not defined in request");
      return res.status(401).json({ message: "Unauthorized request" });
    }

    console.log(`📌 Fetching My Papers for User: ${req.user.id}`); // ✅ Debugging

    const papers = await Paper.find({ createdBy: req.user.id });

    res.status(200).json(papers);
  } catch (error) {
    console.error("❌ Server error fetching my-papers:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ 📌 Delete a Paper (Teacher Only)
const deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!paper) return res.status(404).json({ message: "Paper not found or unauthorized" });

    await Paper.deleteOne({ _id: paper._id });
    res.status(200).json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Get Papers Pending Approval (Admin & SuperAdmin)
const getApprovalPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ status: "Pending" });
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Approve a Paper (Admin)
const approvePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    paper.status = "Approved";
    await paper.save();

    res.status(200).json({ message: "Paper approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Reject a Paper with Reason (Admin)
const rejectPaper = async (req, res) => {
  const { rejectionReason } = req.body;

  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    paper.status = "Rejected";
    paper.rejectionReason = rejectionReason;
    await paper.save();

    res.status(200).json({ message: "Paper rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Get Rejected Papers (Teachers see their own)
const getRejectedPapers = async (req, res) => {
  try {
    const papers = await Paper.find({ createdBy: req.user.id, status: "Rejected" });
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Request Paper Approval (Teacher)
const requestApproval = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    paper.approvalRequested = true;
    await paper.save();

    res.status(200).json({ message: "Paper sent for approval" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Get Status of Papers (SuperAdmin Dashboard)
const getStatusOfPapers = async (req, res) => {
  try {
    const papers = await Paper.find();
    res.status(200).json(papers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Manage Question Pool (Teacher) - Fetch All
const getQuestionPool = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Delete Question from Question Pool (Teacher)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    await Question.deleteOne({ _id: question._id });
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ 📌 Download Paper as PDF (For Users)
const downloadPaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });

    // PDF File Path
    const pdfPath = path.join(__dirname, `../../papers/${paper.paperId}.pdf`);

    // Generate PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text(`Entrance Exam Paper - ${paper.course}`, { align: "center" });
    doc.moveDown();

    // Add Sections
    paper.sections.forEach((section, idx) => {
      doc.fontSize(16).text(`${idx + 1}. ${section.subject}`, { underline: true });
      doc.moveDown(0.5);
      section.questions.forEach((q, qIdx) => {
        doc.fontSize(12).text(`${qIdx + 1}. ${q.questionText}`);
        q.options.forEach((opt, optIdx) => {
          doc.text(`   ${String.fromCharCode(65 + optIdx)}. ${opt}`);
        });
        doc.moveDown(0.5);
      });
      doc.moveDown(1);
    });

    doc.end();

    writeStream.on("finish", () => {
      res.download(pdfPath, `${paper.paperId}.pdf`, (err) => {
        if (err) console.error("Download Error:", err);
      });
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Save a new question
const saveQuestion = async (req, res) => {
  const { course, subject, questionText, options, correctAnswer } = req.body;

  try {
    const newQuestion = new Question({
      course,
      subject,
      questionText,
      options,
      correctAnswer,
    });

    await newQuestion.save();
    res.status(201).json({ message: "Question saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error saving question" });
  }
};

// ✅ Fetch questions for a course
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ course: req.params.course });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching questions" });
  }
};

const generateQuestionPaper = async (req, res) => {
  const { course, customSubject } = req.body;

  if (!course || !customSubject) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Simulate fetching or generating questions
    const questions = [
      { text: "What is AI?", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "Option A" },
      { text: "Explain Big Data.", options: ["A", "B", "C", "D"], correctAnswer: "B" },
    ];

    res.status(200).json({ course, questions });
  } catch (error) {
    console.error("❌ Error generating paper:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPaper,
  getMyPapers,
  deletePaper,
  getApprovalPapers,
  approvePaper,
  rejectPaper,
  getRejectedPapers,
  requestApproval,
  getStatusOfPapers,
  getQuestionPool,
  deleteQuestion,
  downloadPaper,
  saveQuestion, 
  getQuestions,
  generateQuestionPaper
};
