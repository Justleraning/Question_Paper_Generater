const EndPapers = require("../models/EndPapersModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

// Helper function to check if using placeholder user
const isPlaceholderUser = (userId) => {
  return userId.toString() === '000000000000000000000000';
};

// @desc    Get all end papers
// @route   GET /api/endpapers
// @access  Private with fallback
const getAllEndPapers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, subjectCode, status } = req.query;
  
  // Build filter object
  const filter = {};
  if (subjectCode) filter["examDetails.subjectCode"] = subjectCode;
  if (status) filter["metadata.status"] = status;
  
  // If not placeholder user, only show their papers (unless admin)
  if (req.user && !isPlaceholderUser(req.user._id) && req.user.role !== 'admin') {
    filter["metadata.createdBy"] = req.user._id;
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
    if (paper.metadata.createdBy.toString() !== req.user._id.toString()) {
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
    // If metadata is missing, initialize it
    if (!req.body.metadata) {
      req.body.metadata = {};
    }
    
    // Add creator information from user (real or placeholder)
    const paperData = {
      ...req.body,
      metadata: {
        ...req.body.metadata,
        createdBy: req.user._id,
        status: 'draft'
      }
    };
    
    const paper = await EndPapers.create(paperData);
    
    res.status(201).json({
      success: true,
      message: "Paper created successfully",
      paper
    });
  } catch (error) {
    res.status(400);
    throw new Error(`Failed to create paper: ${error.message}`);
  }
});

// @desc    Update an end paper
// @route   PUT /api/endpapers/:id
// @access  Private with fallback
const updateEndPaper = asyncHandler(async (req, res) => {
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
                       req.user._id.toString() === paper.metadata.createdBy.toString() || 
                       req.user.role === 'admin';
  
  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to update this paper");
  }
  
  // Only allow updates if paper is in draft status (unless admin or placeholder)
  if (paper.metadata.status !== 'draft' && !isUsingPlaceholder && req.user.role !== 'admin') {
    res.status(400);
    throw new Error("Cannot update paper that is not in draft status");
  }
  
  // Update the paper
  const updatedPaper = await EndPapers.findByIdAndUpdate(
    id, 
    { 
      ...req.body,
      'metadata.updatedAt': Date.now()
    },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: "Paper updated successfully",
    paper: updatedPaper
  });
});

// @desc    Delete an end paper
// @route   DELETE /api/endpapers/:id
// @access  Private with fallback
const deleteEndPaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find the paper
  const paper = await EndPapers.findById(id);
  
  if (!paper) {
    res.status(404);
    throw new Error("Paper not found");
  }
  
  // Check if user is authorized to delete
  // Always allow if using placeholder user
  const isUsingPlaceholder = isPlaceholderUser(req.user._id);
  const isAuthorized = isUsingPlaceholder || 
                       req.user._id.toString() === paper.metadata.createdBy.toString() || 
                       req.user.role === 'admin';
  
  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to delete this paper");
  }
  
  // Only allow deletion if paper is in draft status (unless admin or placeholder)
  if (paper.metadata.status !== 'draft' && !isUsingPlaceholder && req.user.role !== 'admin') {
    res.status(400);
    throw new Error("Cannot delete paper that is not in draft status");
  }
  
  // Use deleteOne instead of remove (which is deprecated)
  await EndPapers.deleteOne({ _id: id });
  
  res.status(200).json({
    success: true,
    message: "Paper deleted successfully"
  });
});

// @desc    Send paper for approval
// @route   POST /api/endpapers/:id/approval
// @access  Private with fallback
const sendForApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find the paper
  const paper = await EndPapers.findById(id);
  
  if (!paper) {
    res.status(404);
    throw new Error("Paper not found");
  }
  
  // Check if user is authorized
  // Always allow if using placeholder user
  const isUsingPlaceholder = isPlaceholderUser(req.user._id);
  const isAuthorized = isUsingPlaceholder || 
                       req.user._id.toString() === paper.metadata.createdBy.toString() ||
                       req.user.role === 'admin';
  
  if (!isAuthorized) {
    res.status(403);
    throw new Error("Not authorized to send this paper for approval");
  }
  
  // Only allow submission if paper is in draft status
  if (paper.metadata.status !== 'draft') {
    res.status(400);
    throw new Error("This paper has already been submitted for approval");
  }
  
  // Update paper status to 'submitted'
  paper.metadata.status = 'submitted';
  paper.metadata.approvalHistory.push({
    status: 'submitted',
    approvedBy: req.user._id,
    timestamp: Date.now(),
    comments: req.body.comments || 'Submitted for approval'
  });
  
  await paper.save();
  
  res.status(200).json({
    success: true,
    message: "Paper submitted for approval successfully",
    paper: paper
  });
});

// @desc    Process paper approval (approve/reject)
// @route   PUT /api/endpapers/:id/approval
// @access  Private (Admin/Approver only) with fallback
const processPaperApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;
  
  // Validate approval status
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error("Invalid approval status");
  }
  
  // Check if user has approval rights (always allow if placeholder)
  const isUsingPlaceholder = isPlaceholderUser(req.user._id);
  if (!isUsingPlaceholder && !['admin', 'approver'].includes(req.user.role)) {
    res.status(403);
    throw new Error("Not authorized to approve papers");
  }
  
  // Find the paper
  const paper = await EndPapers.findById(id);
  
  if (!paper) {
    res.status(404);
    throw new Error("Paper not found");
  }
  
  // Only process papers in 'submitted' status (unless using placeholder)
  if (!isUsingPlaceholder && paper.metadata.status !== 'submitted') {
    res.status(400);
    throw new Error(`Cannot process approval for a paper that is ${paper.metadata.status}`);
  }
  
  // Update paper status
  paper.metadata.status = status;
  paper.metadata.approvalHistory.push({
    status: status,
    approvedBy: req.user._id,
    timestamp: Date.now(),
    comments: comments || `Paper has been ${status}`
  });
  
  // If approved, set to published
  if (status === 'approved') {
    paper.metadata.status = 'published';
  }
  
  await paper.save();
  
  res.status(200).json({
    success: true,
    message: `Paper ${status} successfully`,
    paper: paper
  });
});

module.exports = {
  getAllEndPapers,
  getEndPaperById,
  createEndPaper,
  updateEndPaper,
  deleteEndPaper,
  sendForApproval,
  processPaperApproval
};