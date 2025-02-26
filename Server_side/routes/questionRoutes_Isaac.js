const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Question = require("../models/Question_Isaac");

router.post("/", async (req, res) => {
  try {
    const { unitId, text, options, correctOption, isImage } = req.body;

    if (
      !unitId ||
      !mongoose.Types.ObjectId.isValid(unitId) ||
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

    const newQuestion = new Question({
      unitId,
      text,
      options: options.map(opt => opt.trim()),
      correctOption,
      isImage: options.some(opt => opt.startsWith("http")),
    });

    await newQuestion.save();
    res.status(201).json({ message: "Question saved successfully!", newQuestion });
  } catch (error) {
    res.status(500).json({ error: "Failed to save question", details: error.message });
  }
});

router.get("/:unitId", async (req, res) => {
  try {
    const { unitId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ error: "Invalid unit ID." });
    }

    const questions = await Question.find({ unitId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch questions", details: error.message });
  }
});

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

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { text, options: options.map(opt => opt.trim()), correctOption, isImage },
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid question ID." });
    }

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
