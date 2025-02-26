const Question = require("../models/Question");

// @desc    Create a new question
// @route   POST /api/questions
// @access  Public
const createQuestion = async (req, res) => {
  try {
      const { unitId, text, options, correctOption, isImage } = req.body;

      console.log("📩 Received question data:", unitId, text, options, correctOption, isImage  ); // ✅ Debugging log

      if (!unitId || !text || !options || !correctOption) {
          return res.status(400).json({ message: "All fields are required" });
      }

      const question = await Question.create({
          unitId,
          text,
          options,
          correctOption,
          isImage,
      });

      console.log("✅ Saved question:", question); // ✅ Debugging log

      res.status(201).json({ newQuestion: question });
  } catch (error) {
      console.error("❌ Error saving question:", error);
      res.status(500).json({ message: "Error saving question", error: error.message });
  }
};


// @desc    Get all questions for a specific unit
// @route   GET /api/questions/:unitId
// @access  Public
const getQuestionsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;

    // Retrieve all questions for a specific unit
    const questions = await Question.find({ unitId });

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
    const updatedQuestion = await Question.findByIdAndUpdate(
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
    const deletedQuestion = await Question.findByIdAndDelete(id);

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
