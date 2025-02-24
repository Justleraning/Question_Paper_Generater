const express = require("express");
const router = express.Router();
const Question = require("../models/Question_Isaac"); // Import the model

// @route   POST /api/questions
// @desc    Create a new question
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { unitId, text, options, correctOption, isImage } = req.body;

    // ✅ Improved Validation
    if (
      !unitId ||
      !mongoose.Types.ObjectId.isValid(unitId) ||  // ✅ Ensure unitId is a valid MongoDB ObjectId
      !text || text.trim() === "" ||               // ✅ Ensure text is not empty
      !options || !Array.isArray(options) ||       // ✅ Ensure options is an array
      options.length !== 4 ||                      // ✅ Ensure there are exactly 4 options
      options.some(opt => typeof opt !== "string" || opt.trim() === "") || // ✅ Ensure all options are non-empty strings
      !correctOption || typeof correctOption !== "string" || correctOption.trim() === "" || // ✅ Ensure correctOption is a valid string
      !options.includes(correctOption)  // ✅ Ensure correctOption matches one of the options
    ) {
      console.error("❌ Validation Failed! Request Data:", {
        unitId, text, options, correctOption, isImage
      });
      return res.status(400).json({ error: "⚠️ All fields are required and must be valid." });
    }

    // ✅ If validation passes, save question
    const newQuestion = new Question({
      unitId,
      text,
      options,
      correctOption,
      isImage,
    });

    await newQuestion.save();
    res.status(201).json({ message: "✅ Question saved successfully!", newQuestion });

  } catch (error) {
    res.status(500).json({ error: "❌ Failed to save question", details: error.message });
  }
});

// @route   GET /api/questions/:unitId
// @desc    Get all questions for a specific unit
// @access  Public
router.get("/:unitId", async (req, res) => {
  try {
    const { unitId } = req.params;

    if (!unitId) {
      return res.status(400).json({ error: "Unit ID is required." });
    }

    const questions = await Question.find({ unitId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions", details: error.message });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update a question by ID
// @access  Public
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctOption, isImage } = req.body;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { text, options, correctOption, isImage },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.json({ message: "Question updated successfully", updatedQuestion });
  } catch (error) {
    res.status(500).json({ error: "Failed to update question", details: error.message });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question by ID
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete question", details: error.message });
  }
});

module.exports = router;
