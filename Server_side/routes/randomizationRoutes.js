const express = require('express');
const router = express.Router();
const Question = require('../models/Question_Isaac');

// Route to handle question randomization
router.post('/', async (req, res) => {
  try {
    const { unitIds, totalMarks } = req.body;

    if (!unitIds || unitIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one unit.' });
    }

    // Fetch questions from the selected units
    const questions = await Question.aggregate([
      { $match: { unitId: { $in: unitIds } } },
      { $sample: { size: 10 } } // Fetch 10 random questions
    ]);

    let selectedQuestions = [];
    let accumulatedMarks = 0;

    // Select questions until totalMarks is reached
    for (let q of questions) {
      if (accumulatedMarks + q.marks <= totalMarks) {
        selectedQuestions.push(q);
        accumulatedMarks += q.marks;
      }
    }

    res.json({ selectedQuestions, totalMarks: accumulatedMarks });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
