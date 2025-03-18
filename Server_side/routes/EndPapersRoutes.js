const express = require("express");
const router = express.Router();
const {
  getAllEndPapers,
  getEndPaperById,
  createEndPaper,
  updateEndPaper,
  deleteEndPaper,
  sendForApproval,
  processPaperApproval,
  updatePaperQuestion
} = require("../controllers/EndPapersController");
const { protect, admin } = require("../middlewares/authMiddleware");
const { endPapersAuth, teacherOwnPapersOnly } = require("../middlewares/EndPapersMiddleware");

// Base route - /api/endpapers
// Use the custom endPapersAuth middleware instead of protect
router.route("/")
  .get(endPapersAuth, getAllEndPapers)
  .post(endPapersAuth, createEndPaper);

router.route("/:id")
  .get(endPapersAuth, teacherOwnPapersOnly, getEndPaperById)
  .put(endPapersAuth, teacherOwnPapersOnly, updateEndPaper)
  .delete(endPapersAuth, teacherOwnPapersOnly, deleteEndPaper);

// New route for inline question editing
router.route("/:id/parts/:partId/questions/:questionId")
  .put(endPapersAuth, teacherOwnPapersOnly, updatePaperQuestion);

// Approval routes - now using endPapersAuth instead of protect
router.route("/:id/approval")
  .post(endPapersAuth, teacherOwnPapersOnly, sendForApproval)
  .put(endPapersAuth, processPaperApproval);

module.exports = router;