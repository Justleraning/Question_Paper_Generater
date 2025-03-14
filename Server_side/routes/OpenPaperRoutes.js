const express = require("express");
const router = express.Router();

const {
  createOpenPaper,
  getAllOpenPapers,
  getOpenPaperById,
  updateOpenPaper,
  deleteOpenPaper,
  getOpenPapersBySubject,
  saveHtmlSnapshot
} = require("../controllers/OpenPapersController");

const {
  openPapersAuth,
  validateOpenPaperInput
} = require("../middlewares/OpenPapersMiddleware");

// Apply authentication to all routes (but doesn't block unauthenticated users)
router.use(openPapersAuth);

// Routes that don't require validation
router.get("/", getAllOpenPapers);
router.get("/subject/:subjectId", getOpenPapersBySubject);
router.get("/:id", getOpenPaperById);

// Routes that require validation
router.post("/", validateOpenPaperInput, createOpenPaper);
router.put("/:id", validateOpenPaperInput, updateOpenPaper);
router.delete("/:id", deleteOpenPaper);

// Special route for saving HTML snapshot
router.post("/:id/snapshot", saveHtmlSnapshot);

module.exports = router;