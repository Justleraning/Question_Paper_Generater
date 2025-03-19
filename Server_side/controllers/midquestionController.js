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
    // Mock action - You can implement actual logic
    res.json({ message: 'Paper sent for approval' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getQuestionsByPaperId,
  randomizeQuestions,
  deletePaper,
  sendForApproval,
};
