const express = require("express");
const { saveQuestion, fetchQuestionsByCourse, getQuestionById,getAllQuestions } = require("../controllers/questionController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Teachers add a new question manually
router.post("/", protect, saveQuestion);  

// ✅ Fetch questions by course (for General Questions Button)
router.get("/", protect, fetchQuestionsByCourse);

// ✅ Get a single question by questionId
router.get("/get-by-id", protect, getQuestionById);  
router.get("/all", getAllQuestions);

module.exports = router;