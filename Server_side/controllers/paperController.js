const Paper = require('../models/Paper');
const mongoose = require('mongoose');

// Save a complete paper
exports.savePaper = async (req, res) => {
  try {
    const { 
      courseName, 
      customSubjectName, 
      totalMarks, 
      examTime, 
      questions 
    } = req.body;

    // Validate input with more detailed checks
    if (!courseName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course name is required' 
      });
    }

    if (!totalMarks) {
      return res.status(400).json({ 
        success: false, 
        message: 'Total marks are required' 
      });
    }

    if (!examTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exam time is required' 
      });
    }

    if (!questions || !questions.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one question is required' 
      });
    }

    // Use authenticated user's ID from middleware
    const createdBy = req.user._id;

    // Prepare paper data with more robust mapping
    const paperData = {
      courseName,
      customSubjectName: customSubjectName || '',
      totalMarks,
      examTime,
      date: new Date().toLocaleDateString(),
      status: 'Not Sent', // Default status
      createdBy, // Use authenticated user's ID
      questions: questions.map(q => ({
        subject: q.subject || 'Unknown',
        question: q.question || '',
        options: q.options.map(opt => ({
          type: opt.type || 'Text',
          value: opt.value || ''
        })),
        correctOption: q.correctOption !== undefined ? q.correctOption : 0,
        index: q.index || 0,
        marks: q.marks || 1
      }))
    };
    // Create and save the new paper
    const newPaper = new Paper(paperData);
    const savedPaper = await newPaper.save();

    res.status(201).json({
      success: true,
      message: 'Paper saved successfully',
      paperId: savedPaper._id
    });
  } catch (error) {
    console.error('Detailed error saving paper:', error);
    
    // Specific error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors
      });
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error',
        details: error.keyValue
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save paper',
      error: {
        message: error.message,
        name: error.name
      }
    });
  }
};

// Get papers created by the current user with optional filtering
exports.getMyPapers = async (req, res) => {
  try {
    const { courseName, customSubjectName, status } = req.query;
    
    // Build query based on user ID and optional filters
    const query = { createdBy: req.user._id };
    
    if (courseName) {
      query.courseName = { $regex: new RegExp(courseName, 'i') };
    }
    
    if (customSubjectName) {
      query.customSubjectName = { $regex: new RegExp(customSubjectName, 'i') };
    }
    
    if (status) {
      query.status = status;
    }

    const papers = await Paper.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      papers
    });
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch papers',
      error: error.message
    });
  }
};

// Delete a paper
exports.deletePaper = async (req, res) => {
  try {
    const paperId = req.params.id;
    const deletedPaper = await Paper.findByIdAndDelete(paperId);
    
    if (!deletedPaper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Paper deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting paper:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting paper',
      error: error.message
    });
  }
};

// Send paper for approval
exports.sendForApproval = async (req, res) => {
  try {
    const paperId = req.params.id;
    
    const paper = await Paper.findById(paperId);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }
    
    // Only the creator of the paper can send it for approval
    if (paper.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this paper'
      });
    }
    
    // Update paper status
    paper.status = 'Pending Approval';
    await paper.save();
    
    res.status(200).json({
      success: true,
      message: 'Paper sent for approval'
    });
  } catch (error) {
    console.error('Error sending paper for approval:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating paper',
      error: error.message
    });
  }
};

// Get papers pending approval (admin only)
exports.getPendingPapers = async (req, res) => {
  try {
    const { courseName, customSubjectName } = req.query;
    
    // Build query for pending papers
    const query = { status: 'Pending Approval' };
    
    if (courseName) {
      query.courseName = { $regex: new RegExp(courseName, 'i') };
    }
    
    if (customSubjectName) {
      query.customSubjectName = { $regex: new RegExp(customSubjectName, 'i') };
    }
    
    const papers = await Paper.find(query)
      .populate('createdBy', 'username fullName ')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      papers
    });
  } catch (error) {
    console.error('Error fetching pending papers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending papers',
      error: error.message
    });
  }
};

// Approve a paper (admin only)
exports.approvePaper = async (req, res) => {
  try {
    const paperId = req.params.id;
    
    const paper = await Paper.findById(paperId);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }
    
    // Update paper status
    paper.status = 'Approved';
    paper.reviewedBy = req.user._id;
    paper.reviewedOn = new Date();
    paper.reviewComments = req.body.comments || 'Approved';
    
    await paper.save();
    
    res.status(200).json({
      success: true,
      message: 'Paper approved successfully'
    });
  } catch (error) {
    console.error('Error approving paper:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving paper',
      error: error.message
    });
  }
};

// Reject a paper (admin only)
exports.rejectPaper = async (req, res) => {
  try {
    const paperId = req.params.id;
    
    // Validate rejection reason
    if (!req.body.comments) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const paper = await Paper.findById(paperId);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }
    
    // Update paper status
    paper.status = 'Rejected';
    paper.reviewedBy = req.user._id;
    paper.reviewedOn = new Date();
    paper.reviewComments = req.body.comments;
    
    await paper.save();
    
    res.status(200).json({
      success: true,
      message: 'Paper rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting paper:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting paper',
      error: error.message
    });
  }
};
// Add this function to your paperController.js file

// Update questions for a specific paper
exports.updatePaperQuestions = async (req, res) => {
  try {
    const paperId = req.params.id;
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid questions array is required'
      });
    }
    
    // Find the paper by ID
    const paper = await Paper.findById(paperId);
    
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found'
      });
    }
    
    // Check if the user is the creator of the paper
    if (paper.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this paper'
      });
    }
    
    // Prevent updating if paper is approved or pending approval
    // if (paper.status === 'Approved' || paper.status === 'Pending Approval') {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Cannot update questions for a paper with status: ${paper.status}`
    //   });
    // }
    
    // Format and validate questions
    const formattedQuestions = questions.map(q => ({
      _id: q._id, // Preserve existing question IDs
      subject: q.subject || 'Unknown',
      question: q.question || '',
      options: q.options.map(opt => ({
        type: opt.type || 'Text',
        value: opt.value || ''
      })),
      correctOption: q.correctOption !== undefined ? q.correctOption : 0,
      index: q.index || 0,
      marks: q.marks || 1
    }));
    
    // Update paper questions
    paper.questions = formattedQuestions;
    
    // If paper was rejected, reset status to Not Sent after question update
    if (paper.status === 'Rejected') {
      paper.status = 'Not Sent';
      paper.reviewComments = ''; // Clear rejection comments
    }
    
    await paper.save();
    
    res.status(200).json({
      success: true,
      message: 'Questions updated successfully',
      paper: {
        _id: paper._id,
        courseName: paper.courseName,
        status: paper.status
      }
    });
  } catch (error) {
    console.error('Error updating paper questions:', error);
    
    // Validation error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating questions',
      error: error.message
    });
  }
};