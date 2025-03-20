const EndPapers = require("../models/EndPapersModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

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
    // Ensure metadata exists
    if (!req.body.metadata) {
      req.body.metadata = {};
    }
    
    // Set status to Pending if not provided
    if (!req.body.status) {
      req.body.status = 'Pending';
    }
    
    // Fallback to placeholder user ID if not present
    const createdBy = req.user && req.user._id 
      ? req.user._id 
      : mongoose.Types.ObjectId('000000000000000000000000');
    
    // Get user name for metadata
    let creatorName = "Unknown"; // Default value
    if (req.user && req.user._id) {
      // First try to get the name from the request body
      if (req.body.metadata && req.body.metadata.creatorName) {
        creatorName = req.body.metadata.creatorName;
      } else {
        // If not in request, try to fetch from User model
        const user = await User.findById(req.user._id).select('name');
        if (user && user.name) {
          creatorName = user.name;
        }
      }
    }
    
    const paperData = {
      ...req.body,
      createdBy: createdBy, // Root level createdBy
      metadata: {
        ...req.body.metadata,
        creatorName: creatorName,
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
    console.error('Paper creation error:', error);
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
                       req.user._id.toString() === paper.createdBy.toString() || 
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
                       req.user._id.toString() === paper.createdBy.toString() || 
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
                       req.user._id.toString() === paper.createdBy.toString() ||
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
  
  // Also update the main status field
  paper.status = 'Pending';
  
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
    paper.status = 'Approved';
  } else if (status === 'rejected') {
    paper.status = 'Rejected';
  }
  
  await paper.save();
  
  res.status(200).json({
    success: true,
    message: `Paper ${status} successfully`,
    paper: paper
  });
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
      res.status(404);
      throw new Error("Paper not found");
    }
    
    // Check if user is authorized
    const isUsingPlaceholder = isPlaceholderUser(req.user._id);
    const isAuthorized = isUsingPlaceholder || 
                       req.user._id.toString() === paper.createdBy.toString() || 
                       req.user.role === 'admin';
    
    if (!isAuthorized) {
      res.status(403);
      throw new Error("Not authorized to update this paper's questions");
    }
    
    // Find the part
    const partIndex = paper.paperStructure.parts.findIndex(p => p.partId === partId);
    
    if (partIndex === -1) {
      res.status(404);
      throw new Error(`Part ${partId} not found`);
    }
    
    // Find the question
    const questionIndex = paper.paperStructure.parts[partIndex].questions.findIndex(
      q => q.questionId === questionId
    );
    
    if (questionIndex === -1) {
      res.status(404);
      throw new Error(`Question ${questionId} not found in part ${partId}`);
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
    
    // Save changes
    await paper.save();
    
    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question: paper.paperStructure.parts[partIndex].questions[questionIndex]
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      success: false,
      message: error.message
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
  updatePaperQuestion
};