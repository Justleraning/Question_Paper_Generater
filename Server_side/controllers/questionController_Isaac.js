
const QuestionIsaac = require("../models/Question_Isaac");

// @desc    Create a new question
// @route   POST /api/questions
// @access  Public
const createQuestion = async (req, res) => {
  try {
    const { subjectId, text, options, correctOption } = req.body;

    if (!subjectId || !text || !options || !correctOption) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const newQuestion = await QuestionIsaac.create({
      subjectId,
      text,
      options,
      correctOption,
      isImage: options.some(opt => opt.startsWith("http")),
    });

    res.status(201).json({ message: "✅ Question saved!", newQuestion });
  } catch (error) {
    console.error("❌ Error saving question:", error);
    res.status(500).json({ message: "Failed to save question", error: error.message });
  }
};


// @desc    Get all questions for a specific unit
// @route   GET /api/questions/:unitId
// @access  Public
const getQuestionsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;

    // Retrieve all questions for a specific unit
    const questions = await QuestionIsaac.find({ unitId });

    if (!questions) {
      return res.status(404).json({ message: "No questions found for this unit" });
    }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error: error.message });
  }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Public
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctOption, isImage } = req.body;

    // Find and update the question
    const updatedQuestion = await QuestionIsaac.findByIdAndUpdate(
      id,
      { text, options, correctOption, isImage },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Error updating question", error: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Public
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the question
    const deletedQuestion = await QuestionIsaac.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting question", error: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByUnit,
  updateQuestion,
  deleteQuestion,
};
