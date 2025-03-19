const express = require("express");
const router = express.Router();
const QuestionPaper = require("../models/QuestionPaper_midsem");

// ✅ Get all saved question papers
router.get("/", async (req, res) => {
  try {
    const papers = await QuestionPaper.find();
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch question papers" });
  }
});

// ✅ Get a single question paper by ID
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching Paper with ID:", req.params.id);
    
    const paper = await QuestionPaper.findById(req.params.id).populate("questions"); // ✅ Populates questions
    
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    
    res.json(paper);
  } catch (error) {
    console.error("Error fetching paper:", error);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// ✅ Delete a paper by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedPaper = await QuestionPaper.findByIdAndDelete(req.params.id);  // Fixed model name
    if (!deletedPaper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting paper" });
  }
});

// ✅ Generate a randomized paper
router.post("/randomize", async (req, res) => {
  try {
    const { subject } = req.body;
    const papers = await QuestionPaper.find({ subject });

    if (!papers.length) {
      return res.status(404).json({ error: "No questions available for this subject" });
    }

    const selectedPaper = papers[Math.floor(Math.random() * papers.length)];
    res.json(selectedPaper);
  } catch (error) {
    res.status(500).json({ error: "Failed to randomize questions" });
  }
});

// ✅ Send for approval (dummy endpoint)
router.post("/send-for-approval", (req, res) => {
  // Implement actual approval logic here
  res.json({ message: "Paper sent for approval!" });
});

module.exports = router;
