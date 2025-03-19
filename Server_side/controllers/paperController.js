const Paper = require('../models/Paper');
const mongoose = require('mongoose');

// Save a complete paper
// In paperController.js
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
    // Remove mongoose transaction
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

// Get papers created by the current user
// Get papers created by the current user
exports.getMyPapers = async (req, res) => {
  try {
    const query = { 
      createdBy: req.user._id
    };

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