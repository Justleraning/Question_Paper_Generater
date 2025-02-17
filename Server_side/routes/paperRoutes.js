const express = require("express");
const {
  createPaper,
  getMyPapers,
  getApprovalPapers,
  approvePaper,
  rejectPaper,
  getRejectedPapers,
  getStatusOfPapers,
  downloadPaper,
  requestApproval,
  saveQuestion,
  getQuestions,
  generateQuestionPaper,
} = require("../controllers/paperController");

const { protect, adminOnly, superAdminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Teachers create a paper
router.post("/", protect, createPaper);

// ✅ Teachers view their own papers (My Papers Tab)
router.get("/my-papers", protect, getMyPapers);

// ✅ Admins view papers pending approval
router.get("/view", protect, adminOnly, getApprovalPapers);

// ✅ Admin Approves a paper
router.patch("/:id/approve", protect, adminOnly, approvePaper);

// ✅ Admin Rejects a paper (Requires a reason)
router.patch("/:id/reject", protect, adminOnly, rejectPaper);

// ✅ Teachers can see their rejected papers
router.get("/rejected", protect, getRejectedPapers);

// ✅ Admins & Super Admins view paper statuses
router.get("/status", protect, adminOnly, getStatusOfPapers);

// ✅ All users can download approved papers
router.get("/:id/download", protect, downloadPaper);

router.patch("/:id/request-approval", protect, adminOnly, requestApproval);

router.post("/save-question", protect, saveQuestion);

router.get("/questions/:course", protect, getQuestions);

router.post("/generate-paper", generateQuestionPaper);

module.exports = router;
