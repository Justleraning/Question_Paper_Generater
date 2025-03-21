const EndPapers = require("../models/EndPapersModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Helper function to check if using placeholder user
const isPlaceholderUser = (userId) => {
  return userId.toString() === '000000000000000000000000';
};

// Helper function to normalize status fields
const normalizeStatusFields = (paperData) => {
  // Clone the data to avoid modifying the original
  const normalizedData = { ...paperData };
  
  // Handle root status field (capitalize first letter)
  if (normalizedData.status) {
    normalizedData.status = normalizedData.status.charAt(0).toUpperCase() + 
                           normalizedData.status.slice(1).toLowerCase();
  }
  
  // Handle metadata.status field (lowercase)
  if (normalizedData.metadata && normalizedData.metadata.status) {
    normalizedData.metadata.status = normalizedData.metadata.status.toLowerCase();
  }
  
  return normalizedData;
};

// @desc    Get all end papers
// @route   GET /api/endpapers
// @access  Private with fallback
const getAllEndPapers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, subjectCode, status } = req.query;
  
  // Build filter object
  const filter = {};
  if (subjectCode) filter["examDetails.subjectCode"] = subjectCode;
  if (status) filter.status = status;
  
  // If not placeholder user, only show their papers (unless admin)
  if (req.user && !isPlaceholderUser(req.user._id) && req.user.role !== 'admin') {
    filter.createdBy = req.user._id;
  }
  
  // Get papers with pagination
  const papers = await EndPapers.find(filter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ "metadata.createdAt": -1 });
    
  // Get total documents count
  const count = await EndPapers.countDocuments(filter);
  
  res.status(200).json({
    papers,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalItems: count
  });
});

// @desc    Get end paper by ID
// @route   GET /api/endpapers/:id
// @access  Private with fallback
const getEndPaperById = asyncHandler(async (req, res) => {
  const paper = await EndPapers.findById(req.params.id);
  
  if (!paper) {
    res.status(404);
    throw new Error("Paper not found");
  }
  
  // If not placeholder user, check if they own this paper (unless admin)
  if (req.user && !isPlaceholderUser(req.user._id) && req.user.role !== 'admin') {
    if (paper.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this paper");
    }
  }
  
  res.status(200).json(paper);
});

// @desc    Create a new end paper
// @route   POST /api/endpapers
// @access  Private with fallback
const createEndPaper = asyncHandler(async (req, res) => {
  try {
    // Normalize the status fields in the request body
    const normalizedData = normalizeStatusFields(req.body);
    
    // Ensure metadata exists
    if (!normalizedData.metadata) {
      normalizedData.metadata = {};
    }
    
    // Set status to Draft if not provided
    if (!normalizedData.status) {
      normalizedData.status = 'Draft';
    }
    
    // Fallback to placeholder user ID if not present
    const createdBy = req.user && req.user._id 
      ? req.user._id 
      : mongoose.Types.ObjectId('000000000000000000000000');
    
    // Get user name for metadata
    let creatorName = "Unknown"; // Default value
    if (req.user && req.user._id) {
      // First try to get the name from the request body
      if (normalizedData.metadata && normalizedData.metadata.creatorName) {
        creatorName = normalizedData.metadata.creatorName;
      } else {
        // If not in request, try to fetch from User model
        const user = await User.findById(req.user._id).select('name');
        if (user && user.name) {
          creatorName = user.name;
        }
      }
    }
    
    const paperData = {
      ...normalizedData,
      createdBy: createdBy, // Root level createdBy
      metadata: {
        ...normalizedData.metadata,
        creatorName: creatorName,
        status: 'draft',
        approvalHistory: [] // Initialize approval history
      },
      status: 'Draft' // Ensure root status is set correctly
    };
    
    const paper = await EndPapers.create(paperData);
    
    res.status(201).json({
      success: true,
      message: "Paper created successfully",
      paper
    });
  } catch (error) {
    console.error('Paper creation error:', error);
    res.status(400);
    throw new Error(`Failed to create paper: ${error.message}`);
  }
});

// @desc    Update an end paper
// @route   PUT /api/endpapers/:id
// @access  Private with fallback
const updateEndPaper = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the paper
    const paper = await EndPapers.findById(id);
    
    if (!paper) {
      res.status(404);
      throw new Error("Paper not found");
    }
    
    // Check if user is authorized to update
    // Always allow if using placeholder user
    const isUsingPlaceholder = isPlaceholderUser(req.user._id);
    const isAuthorized = isUsingPlaceholder || 
                         req.user._id.toString() === paper.createdBy.toString() || 
                         req.user.role === 'admin';
    
    if (!isAuthorized) {
      res.status(403);
      throw new Error("Not authorized to update this paper");
    }
    
    // Only allow updates if paper is in Draft or Rejected status (unless admin or placeholder)
    if (paper.status !== 'Draft' && paper.status !== 'Rejected' && 
        !isUsingPlaceholder && req.user.role !== 'admin') {
      res.status(400);
      throw new Error("Cannot update paper that is not in Draft or Rejected status");
    }
    
    // Clone the request body to avoid modifying the original
    const updateData = { ...req.body };
    
    // Extract metadata field to avoid conflicts
    const metadataUpdate = updateData.metadata;
    delete updateData.metadata;
    
    // Update standard fields first
    let updatedPaper = await EndPapers.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    );
    
    // If there's metadata to update, handle it separately
    if (metadataUpdate) {
      // Handle metadata.status case normalization
      if (metadataUpdate.status) {
        metadataUpdate.status = metadataUpdate.status.toLowerCase();
      }
      
      // Update metadata fields individually to avoid conflicts
      updatedPaper = await EndPapers.findByIdAndUpdate(
        id,
        { 
          $set: {
            'metadata.status': metadataUpdate.status || updatedPaper.metadata.status,
            'metadata.creatorName': metadataUpdate.creatorName || updatedPaper.metadata.creatorName,
            'metadata.updatedAt': Date.now()
          }
        },
        { new: true, runValidators: true }
      );
    }
    
    res.status(200).json({
      success: true,
      message: "Paper updated successfully",
      paper: updatedPaper
    });
  } catch (error) {
    console.error("Error updating paper:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "An error occurred while updating the paper"
    });
  }
});

// @desc    Delete an end paper
// @route   DELETE /api/endpapers/:id
// @access  Private with fallback
const deleteEndPaper = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the paper
    const paper = await EndPapers.findById(id);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }
    
    // Check if user is authorized to delete
    // Always allow if using placeholder user
    const isUsingPlaceholder = isPlaceholderUser(req.user._id);
    const isAuthorized = isUsingPlaceholder || 
                         req.user._id.toString() === paper.createdBy.toString() || 
                         req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this paper"
      });
    }
    
    // Only allow deletion if paper is in Draft or Rejected status (unless admin or placeholder)
    // Or modify it to include more statuses, for example:
if (paper.status !== 'Draft' && paper.status !== 'Rejected' && paper.status !== 'Approved' && 
  !isUsingPlaceholder && req.user.role !== 'admin') {
return res.status(400).json({
  success: false,
  message: "Cannot delete paper that is in Submitted or Published status"
});
}
    
    // Use deleteOne instead of remove (which is deprecated)
    await EndPapers.deleteOne({ _id: id });
    
    return res.status(200).json({
      success: true,
      message: "Paper deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting paper:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete paper: " + error.message
    });
  }
});

// @desc    Send paper for approval
// @route   POST /api/endpapers/:id/approval
// @access  Private with fallback
const sendForApproval = asyncHandler(async (req, res) => {
  try {
    console.log("=== BACKEND: SEND FOR APPROVAL - START ===");
    const { id } = req.params;
    console.log("Paper ID:", id);
    
    // Find the paper
    const paper = await EndPapers.findById(id);
    
    if (!paper) {
      res.status(404);
      throw new Error("Paper not found");
    }
    
    console.log("Paper found:", {
      id: paper._id,
      status: paper.status,
      metadataStatus: paper.metadata?.status
    });
    
    // Check if user is authorized
    const isUsingPlaceholder = isPlaceholderUser(req.user._id);
    const isAuthorized = isUsingPlaceholder || 
                       req.user._id.toString() === paper.createdBy.toString() ||
                       req.user.role === 'admin';
    
    if (!isAuthorized) {
      res.status(403);
      throw new Error("Not authorized to send this paper for approval");
    }
    
    // Make status check case-insensitive
    // Convert paper status to lowercase for comparison
    const currentStatus = paper.status.toLowerCase();
    
    if (currentStatus !== 'draft' && currentStatus !== 'rejected') {
      console.error(`Cannot submit paper with status: ${paper.status}`);
      res.status(400);
      throw new Error(`Only papers in draft or rejected status can be submitted for approval. Current status: ${paper.status}`);
    }
    
    // Update paper statuses with the CORRECT CASE for each field:
    // - metadata.status should be lowercase
    // - status should be uppercase
    paper.metadata.status = 'submitted';  // lowercase for metadata.status
    paper.status = 'Submitted';           // uppercase for main status
    
    // Add entry to approval history
    if (!paper.metadata.approvalHistory) {
      paper.metadata.approvalHistory = [];
    }
    
    paper.metadata.approvalHistory.push({
      status: 'submitted',
      approvedBy: req.user._id,
      timestamp: Date.now(),
      comments: req.body.comments || 'Submitted for approval'
    });
    
    // Set submittedAt timestamp if not set
    if (!paper.metadata.submittedAt) {
      paper.metadata.submittedAt = Date.now();
    }
    
    // Clear any previous rejection reasons
    paper.reviewComments = '';
    paper.reviewedBy = null;
    paper.reviewedOn = null;
    
    console.log("Saving paper with updated status:", {
      status: paper.status,
      metadataStatus: paper.metadata.status
    });
    
    await paper.save();
    
    console.log("Paper successfully updated with new status:", paper.status);
    
    res.status(200).json({
      success: true,
      message: "Paper submitted for approval successfully",
      paper: paper
    });
  } catch (error) {
    console.error("=== BACKEND: SEND FOR APPROVAL - ERROR ===", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit paper for approval"
    });
  }
});

// @desc    Process paper approval (approve/reject)
// @route   PUT /api/endpapers/:id/approval
// @access  Private (Admin/Approver only) with fallback
const processPaperApproval = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    
    // Validate approval status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status"
      });
    }
    
    // Check if user has approval rights (always allow if placeholder)
    const isUsingPlaceholder = isPlaceholderUser(req.user._id);
    if (!isUsingPlaceholder && !['admin', 'approver', 'Admin', 'SuperAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to approve papers"
      });
    }
    
    // Find the paper
    const paper = await EndPapers.findById(id);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }
    
    // Only process papers in 'Submitted' status (case-insensitive)
    const currentStatus = paper.status.toLowerCase();
    if (!isUsingPlaceholder && currentStatus !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot process approval for a paper that is ${paper.status}`
      });
    }
    
    // Update metadata.status (lowercase)
    paper.metadata.status = status; // using lowercase from request
    
    // Update main status (uppercase first letter)
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    paper.status = capitalizedStatus;
    
    // Add entry to approval history
    if (!paper.metadata.approvalHistory) {
      paper.metadata.approvalHistory = [];
    }
    
    paper.metadata.approvalHistory.push({
      status,
      approvedBy: req.user._id,
      timestamp: Date.now(),
      comments: comments || `Paper has been ${status}`
    });
    
    // Update review fields
    paper.reviewComments = comments || '';
    paper.reviewedBy = req.user._id;
    paper.reviewedOn = new Date();
    
    // Set approval timestamp if not already set and the paper is approved
    if (status === 'approved' && !paper.metadata.approvedAt) {
      paper.metadata.approvedAt = Date.now();
    }
    
    console.log("Saving paper with updated status:", {
      status: paper.status,
      metadataStatus: paper.metadata.status
    });
    
    await paper.save();
    
    return res.status(200).json({
      success: true,
      message: `Paper ${status} successfully`,
      paper: paper
    });
  } catch (error) {
    console.error("Error processing paper approval:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process paper approval: " + error.message
    });
  }
});

// @desc    Update a specific question in a paper
// @route   PUT /api/endpapers/:id/parts/:partId/questions/:questionId
// @access  Private with fallback
const updatePaperQuestion = asyncHandler(async (req, res) => {
  try {
    const { id, partId, questionId } = req.params;
    const { questionText, unit, bloomLevel, marks } = req.body;
    
    // Find the paper
    const paper = await EndPapers.findById(id);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found"
      });
    }
    
    // Check if user is authorized
    const isUsingPlaceholder = isPlaceholderUser(req.user._id);
    const isAuthorized = isUsingPlaceholder || 
                       req.user._id.toString() === paper.createdBy.toString() || 
                       req.user.role === 'admin';
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this paper's questions"
      });
    }
    
    // Only allow updates if paper is in Draft or Rejected status (unless admin or placeholder)
    if (paper.status !== 'Draft' && paper.status !== 'Rejected' && 
        !isUsingPlaceholder && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: "Cannot update questions for a paper that is not in Draft or Rejected status"
      });
    }
    
    // Find the part
    const partIndex = paper.paperStructure.parts.findIndex(p => p.partId === partId);
    
    if (partIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Part ${partId} not found`
      });
    }
    
    // Find the question
    const questionIndex = paper.paperStructure.parts[partIndex].questions.findIndex(
      q => q.questionId === questionId
    );
    
    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Question ${questionId} not found in part ${partId}`
      });
    }
    
    // Update question fields
    if (questionText) {
      paper.paperStructure.parts[partIndex].questions[questionIndex].questionText = questionText;
    }
    
    if (unit) {
      paper.paperStructure.parts[partIndex].questions[questionIndex].unit = unit;
    }
    
    if (bloomLevel) {
      paper.paperStructure.parts[partIndex].questions[questionIndex].bloomLevel = bloomLevel;
    }
    
    if (marks) {
      paper.paperStructure.parts[partIndex].questions[questionIndex].marks = marks;
    }
    
    // Update the timestamps
    paper.metadata.updatedAt = Date.now();
    
    // Save changes
    await paper.save();
    
    return res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: paper.paperStructure.parts[partIndex].questions[questionIndex]
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the question"
    });
  }
});

// @desc    Get papers pending approval (for admins)
// @route   GET /api/endpapers/approvals
// @access  Private (Admin/Approver only)
const getPendingApprovals = asyncHandler(async (req, res) => {
  try {
    // Check if user has approval rights (always allow if placeholder)
    const isUsingPlaceholder = isPlaceholderUser(req.user._id);
    if (!isUsingPlaceholder && !['admin', 'approver', 'Admin', 'SuperAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view pending approvals"
      });
    }
    
    // Get all papers with status 'Submitted'
    const pendingPapers = await EndPapers.find({ status: 'Submitted' })
      .sort({ "metadata.submittedAt": -1 });
      
    return res.status(200).json({
      success: true,
      count: pendingPapers.length,
      papers: pendingPapers
    });
  } catch (error) {
    console.error("Error getting pending approvals:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get pending approvals: " + error.message
    });
  }
});

module.exports = {
  getAllEndPapers,
  getEndPaperById,
  createEndPaper,
  updateEndPaper,
  deleteEndPaper,
  sendForApproval,
  processPaperApproval,
  updatePaperQuestion,
  getPendingApprovals
};