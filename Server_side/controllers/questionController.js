const Question = require("../models/Question");

const addQuestion = async (req, res) => {
  const { course, subject, questionText, options, correctAnswer } = req.body;

  try {
    const newQuestion = new Question({
      course,
      subject,
      questionText,
      options,
      correctAnswer,
      createdBy: req.user.id,
    });

    await newQuestion.save();
    res.status(201).json({ message: "Question added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const fetchQuestionsByCourse = async (req, res) => {
  const { course } = req.query;

  try {
    const questionPool = {
      LogicalReasoning: await Question.find({ course, subject: "Logical Reasoning" }).limit(15),
      QuantitativeAptitude: await Question.find({ course, subject: "Quantitative Aptitude" }).limit(15),
      English: await Question.find({ course, subject: "English" }).limit(10),
      Custom: await Question.find({ course, subject: "Custom" }).limit(10),
    };

    res.status(200).json(questionPool);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addQuestion, fetchQuestionsByCourse };
