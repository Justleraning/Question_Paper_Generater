const express = require("express");
const router = express.Router();
const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");

// @route   POST /api/subjects
// @desc    Create a new subject
// @access  Public
router.post("/", async (req, res, next) => {
  console.log("📩 Incoming API request to create subject:", req.body);
  try {
    await createSubject(req, res);
  } catch (error) {
    console.error("❌ Error in subject creation route:", error.message);
    next(error);
  }
});

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Public
router.get("/", getAllSubjects);

// @route   GET /api/subjects/:id
// @desc    Get a subject by ID
// @access  Public
router.get("/:id", getSubjectById);

// @route   PUT /api/subjects/:id
// @desc    Update a subject by ID
// @access  Public
router.put("/:id", updateSubject);

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject by ID
// @access  Public
router.delete("/:id", deleteSubject);

module.exports = router;
