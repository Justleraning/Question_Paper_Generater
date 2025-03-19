const midsQuestion = require('../models/midQuestion');

// ✅ Get questions by paper ID
const getQuestionsByPaperId = async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await midsQuestion.find({ _id: id });
    if (!questions) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    res.json(questions[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Randomize questions
const randomizeQuestions = async (req, res) => {
  try {
    const { subject } = req.body;
    const questions = await midsQuestion.find({ subject });

    if (questions.length < 19) {
      return res.status(400).json({ message: 'Not enough questions to randomize.' });
    }

    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    res.json({ subject, questions: shuffledQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete paper
const deletePaper = async (req, res) => {
  try {
    const { id } = req.params;
    await Question.deleteOne({ _id: id });
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Send for approval (mock)
const sendForApproval = async (req, res) => {
  try {
      const { paperId, userId } = req.body;
  
      if (!paperId) {
        return res.status(400).json({ error: "Paper ID is required" });
      }
  
      // Find the paper
      const paper = await QuestionPaper.findById(paperId);
  
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
  
      // Update paper status
      paper.status = 'Submitted';
      paper.submittedBy = userId;
      paper.submittedAt = new Date();
  
      await paper.save();
  
      res.json({ 
        message: "Paper sent for approval! ✅", 
        paper: {
          id: paper._id,
          subject: paper.subject,
          status: paper.status
        }
      });
    } catch (error) {
      console.error("Error sending paper for approval:", error);
      res.status(500).json({ error: "Failed to send paper for approval" });
    }
};


module.exports = {
  getQuestionsByPaperId,
  randomizeQuestions,
  deletePaper,
  sendForApproval,
};
