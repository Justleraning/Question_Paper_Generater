const express = require("express");
const { addQuestion, fetchQuestionsByCourse } = require("../controllers/questionController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Teachers add a new question manually
router.post("/", protect, addQuestion);

// ✅ Fetch questions by course (for General Questions Button)
router.get("/", protect, fetchQuestionsByCourse);

module.exports = router;
