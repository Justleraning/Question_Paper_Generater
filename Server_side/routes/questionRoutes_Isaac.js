const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const QuestionIsaac = require("../models/Question_Isaac");


// ✅ Create a question (using subjectId instead of unitId)
router.post("/", async (req, res) => {
  try {
    const { subjectId, text, options, correctOption, index, subject, courseName } = req.body;

    // ✅ Validate Request Data
    if (
      !subjectId ||
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !text || text.trim() === "" ||
      !Array.isArray(options) || options.length !== 4 || 
      options.some(opt => typeof opt !== "string" || opt.trim() === "") ||
      !correctOption || !["A", "B", "C", "D"].includes(correctOption) ||
      typeof index !== "number" ||
      !subject || subject.trim() === "" ||
      !courseName || courseName.trim() === ""
    ) {
      return res.status(400).json({ error: "Invalid input data." });
    }

    // ✅ Save Question
    const newQuestion = new QuestionIsaac({
      subjectId,
      text,
      options: options.map(opt => opt.trim()),
      correctOption,
      index,
      subject,
      courseName,
      isImage: options.some(opt => opt.startsWith("http")),
    });

    await newQuestion.save();
    res.status(201).json({ message: "✅ Question saved successfully!", newQuestion });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to save question", details: error.message });
  }
});
router.get("/all", async (req, res) => {
  try {
    const questions = await QuestionIsaac.find()
      .populate("subjectId", "name code");  // This is where the subject fields are populated
    if (!questions.length) {
      return res.status(404).json({ error: "No questions found in the database." });
    }
    res.json(questions);
  } catch (error) {
    console.error("❌ Error fetching all questions:", error);
    res.status(500).json({ error: "Failed to fetch questions", details: error.message });
  }
});


// ✅ Fix subject-specific fetching (Ensures it pulls from `QuestionIsaac`)
router.get("/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ error: "Invalid subject ID." });
    }

    const questions = await QuestionIsaac.find({ subjectId })
      .populate('subjectId', 'name code'); // This will fetch the subject name and code from the 'subjects' collection

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch questions", details: error.message });
  }
});


// ✅ Update a question
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, correctOption, isImage } = req.body;

    if (
      !text ||
      text.trim() === "" ||
      !options ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some(opt => typeof opt !== "string" || opt.trim() === "") ||
      !correctOption ||
      typeof correctOption !== "string" ||
      correctOption.trim() === "" ||
      !["A", "B", "C", "D"].includes(correctOption)
    ) {
      return res.status(400).json({ error: "Invalid input data." });
    }

    const updatedQuestion = await QuestionIsaac.findByIdAndUpdate(
      id,
      { text, options: options.map(opt => opt.trim()), correctOption, isImage },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.json({ message: "✅ Question updated successfully", updatedQuestion });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to update question", details: error.message });
  }
});

// ✅ Delete a question
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid question ID." });
    }

    const deletedQuestion = await QuestionIsaac.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found." });
    }

    res.json({ message: "✅ Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to delete question", details: error.message });
  }
});




module.exports = router;
