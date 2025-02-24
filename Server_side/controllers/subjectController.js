const Subject = require("../models/Subject");

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Public
const createSubject = async (req, res) => {
  try {
    console.log("📥 Incoming request to create subject:", req.body); // ✅ Log request payload

    let { name, code } = req.body;

    // ✅ Normalize to lowercase for case-insensitive uniqueness
    name = name.trim().toLowerCase();
    code = code.trim().toUpperCase(); // Codes are often uppercase

    console.log(`🔍 Checking if subject with normalized name '${name}' or code '${code}' already exists...`);

    const existingSubject = await Subject.findOne({ 
      $or: [{ name }, { code }]  // Case-insensitive check
    });

    if (existingSubject) {
      console.warn("⚠️ Subject already exists:", existingSubject);
      return res.status(400).json({ message: "Subject with same name or code already exists" });
    }

    console.log("📝 Creating new subject...");
    const subject = await Subject.create({ name, code });

    console.log("✅ Subject created successfully:", subject);
    return res.status(201).json(subject);
  } catch (error) {
    console.error("❌ Error creating subject:", error.message);
    return res.status(500).json({ message: "Error creating subject", error: error.message });
  }
};


// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subjects", error: error.message });
  }
};

// @desc    Get a single subject by ID
// @route   GET /api/subjects/:id
// @access  Public
const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subject", error: error.message });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Public
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    // Validate input
    if (!name || !code) {
      return res.status(400).json({ message: "Name and Code are required" });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { name, code },
      { new: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ message: "Error updating subject", error: error.message });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Public
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting subject", error: error.message });
  }
};

module.exports = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
