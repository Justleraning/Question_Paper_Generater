const express = require("express");
const { saveQuestion, fetchQuestionsByCourse, getQuestions, getQuestionByIndex } = require("../controllers/questionController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Teachers add a new question manually
router.post("/", protect, saveQuestion);  

// ✅ Fetch questions by course (for General Questions Button)
router.get("/", protect, fetchQuestionsByCourse);

// ✅ Get a single question by index
router.get("/get", protect, getQuestionByIndex);  

module.exports = router;
