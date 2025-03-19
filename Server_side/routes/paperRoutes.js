const express = require("express");
const paperController = require("../controllers/paperController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const router = express.Router();

// Paper creation and management
router.post("/save", protect, paperController.savePaper);
router.get("/my-papers", protect, paperController.getMyPapers);
router.delete("/:id", protect, paperController.deletePaper);
router.put("/:id/questions", protect, paperController.updatePaperQuestions); // Add this new route

// Approval workflow endpoints
router.patch("/:id/send-for-approval", protect, paperController.sendForApproval);
router.get("/pending", protect, adminOnly, paperController.getPendingPapers);
router.patch("/:id/approve", protect, adminOnly, paperController.approvePaper);
router.patch("/:id/reject", protect, adminOnly, paperController.rejectPaper);

module.exports = router;