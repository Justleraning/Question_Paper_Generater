const express = require("express");
const router = express.Router();
const {
  getAllEndPapers,
  getEndPaperById,
  createEndPaper,
  updateEndPaper,
  deleteEndPaper,
  sendForApproval,
  processPaperApproval
} = require("../controllers/EndPapersController");
const { protect, admin } = require("../middlewares/authMiddleware");
const { endPapersAuth } = require("../middlewares/EndPapersMiddleware");

// Base route - /api/endpapers
// Use the custom endPapersAuth middleware instead of protect
router.route("/")
  .get(endPapersAuth, getAllEndPapers)
  .post(endPapersAuth, createEndPaper);

router.route("/:id")
  .get(endPapersAuth, getEndPaperById)
  .put(endPapersAuth, updateEndPaper)
  .delete(endPapersAuth, deleteEndPaper);

// Approval routes - keep these with standard authentication
router.route("/:id/approval")
  .post(protect, sendForApproval)
  .put(protect, processPaperApproval);

module.exports = router;