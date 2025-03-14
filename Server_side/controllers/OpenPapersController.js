const OpenPapers = require("../models/OpenPapersModel");
const Subject = require("../models/Subject"); // Make sure this model exists
const mongoose = require("mongoose");

// Create a new open paper
const createOpenPaper = async (req, res) => {
  try {
    console.log("🔄 Creating new open paper with data:", JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const { title, subject, subjectName, paperType, questions, totalMarks } = req.body;
    
    if (!title || !subject || !paperType || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields or invalid questions array" 
      });
    }
    
    // Add user ID from auth middleware if available
    const paperData = {
      ...req.body,
      createdBy: req.user ? req.user._id : null
    };
    
    // Create the new paper
    const newPaper = await OpenPapers.create(paperData);
    
    console.log("✅ Paper created successfully with ID:", newPaper._id);
    
    res.status(201).json({
      success: true,
      message: "Paper created successfully",
      data: newPaper
    });
  } catch (error) {
    console.error("❌ Error creating paper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create paper",
      error: error.message
    });
  }
};

// Get all open papers
const getAllOpenPapers = async (req, res) => {
  try {
    const papers = await OpenPapers.find()
      .populate("subject", "name code")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    console.error("❌ Error fetching papers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch papers",
      error: error.message
    });
  }
};

// Get a single open paper by ID
const getOpenPaperById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paper ID format"
      });
    }
    
    const paper = await OpenPapers.findById(id)
      .populate("subject", "name code")
      .populate("createdBy", "name email");
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: paper
    });
  } catch (error) {
    console.error("❌ Error fetching paper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch paper",
      error: error.message
    });
  }
};

// Update an open paper
const updateOpenPaper = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paper ID format"
      });
    }
    
    // Find the paper first to check if it exists
    const existingPaper = await OpenPapers.findById(id);
    
    if (!existingPaper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }
    
    // Update the paper
    const updatedPaper = await OpenPapers.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Paper updated successfully",
      data: updatedPaper
    });
  } catch (error) {
    console.error("❌ Error updating paper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update paper",
      error: error.message
    });
  }
};

// Delete an open paper
const deleteOpenPaper = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paper ID format"
      });
    }
    
    const paper = await OpenPapers.findByIdAndDelete(id);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Paper deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting paper:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete paper",
      error: error.message
    });
  }
};

// Get papers by subject
const getOpenPapersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject ID format"
      });
    }
    
    const papers = await OpenPapers.find({ subject: subjectId })
      .populate("subject", "name code")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    console.error("❌ Error fetching papers by subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch papers",
      error: error.message
    });
  }
};

// Save paper as HTML snapshot
const saveHtmlSnapshot = async (req, res) => {
  try {
    const { id } = req.params;
    const { htmlContent } = req.body;
    
    if (!id || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Paper ID and HTML content are required"
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid paper ID format"
      });
    }
    
    const updatedPaper = await OpenPapers.findByIdAndUpdate(
      id,
      { htmlSnapshot: htmlContent },
      { new: true }
    );
    
    if (!updatedPaper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "HTML snapshot saved successfully",
      data: {
        id: updatedPaper._id,
        title: updatedPaper.title
      }
    });
  } catch (error) {
    console.error("❌ Error saving HTML snapshot:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save HTML snapshot",
      error: error.message
    });
  }
};

module.exports = {
  createOpenPaper,
  getAllOpenPapers,
  getOpenPaperById,
  updateOpenPaper,
  deleteOpenPaper,
  getOpenPapersBySubject,
  saveHtmlSnapshot
};