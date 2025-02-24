const Question = require("../models/Question");

// @desc    Randomize and reduce questions
// @route   POST /api/randomize
// @access  Public
const randomizeQuestions = async (req, res) => {
  try {
    const { totalMarks, unitIds } = req.body;

    // Validate the input
    if (!totalMarks || !unitIds || unitIds.length === 0) {
      return res.status(400).json({ message: "Total marks and unit IDs are required" });
    }

    // Determine the total number of questions needed
    const totalQuestions = totalMarks === 20 ? 20 : 30;
    const questionsPerUnit = Math.floor(totalQuestions / unitIds.length);

    // Fetch questions for each unit
    let randomizedQuestions = [];
    for (const unitId of unitIds) {
      const unitQuestions = await Question.find({ unitId });

      if (unitQuestions.length < questionsPerUnit) {
        return res.status(400).json({
          message: `Not enough questions in Unit ID: ${unitId} to fulfill the requirement`,
        });
      }

      // Shuffle the unit questions
      const shuffledQuestions = unitQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, questionsPerUnit);

      randomizedQuestions = randomizedQuestions.concat(shuffledQuestions);
    }

    // Shuffle the combined list to ensure randomness
    randomizedQuestions = randomizedQuestions.sort(() => Math.random() - 0.5);

    // Respond with the randomized and reduced questions
    res.status(200).json(randomizedQuestions);
  } catch (error) {
    res.status(500).json({ message: "Error randomizing questions", error: error.message });
  }
};

// @desc    Preview randomized questions
// @route   POST /api/randomize/preview
// @access  Public
const previewRandomizedQuestions = async (req, res) => {
  try {
    const { randomizedQuestions } = req.body;

    if (!randomizedQuestions || randomizedQuestions.length === 0) {
      return res.status(400).json({ message: "No randomized questions provided" });
    }

    // Send the preview of the randomized questions
    res.status(200).json(randomizedQuestions);
  } catch (error) {
    res.status(500).json({ message: "Error previewing questions", error: error.message });
  }
};

module.exports = {
  randomizeQuestions,
  previewRandomizedQuestions,
};
