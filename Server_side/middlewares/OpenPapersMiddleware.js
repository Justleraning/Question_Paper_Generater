const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes - authentication
const openPapersAuth = async (req, res, next) => {
  try {
    // Check if token exists in headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Allow unauthenticated access but mark as guest
      req.isGuest = true;
      return next();
    }
    
    // Extract token
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      req.isGuest = true;
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        req.isGuest = true;
        return next();
      }
      
      // Attach user to request
      req.user = user;
      req.isGuest = false;
      
      next();
    } catch (error) {
      // If token verification fails, continue as guest
      console.warn("⚠️ Token verification failed:", error.message);
      req.isGuest = true;
      next();
    }
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    req.isGuest = true;
    next();
  }
};

// Middleware to validate open paper input
const validateOpenPaperInput = (req, res, next) => {
  try {
    const { title, subject, questions, totalMarks } = req.body;
    
    // Validate basic required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Paper title is required"
      });
    }
    
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required"
      });
    }
    
    // Validate questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions must be a non-empty array"
      });
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.text) {
        return res.status(400).json({
          success: false,
          message: `Question at index ${i} is missing text`
        });
      }
      
      if (!question.options || (
          !Array.isArray(question.options) && 
          typeof question.options !== 'object'
        )) {
        return res.status(400).json({
          success: false,
          message: `Question at index ${i} has invalid options format`
        });
      }
      
      if (!question.correctOption) {
        return res.status(400).json({
          success: false,
          message: `Question at index ${i} is missing correctOption`
        });
      }
    }
    
    // Validate totalMarks
    if (!totalMarks || isNaN(totalMarks) || totalMarks <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total marks must be a positive number"
      });
    }
    
    // If all validations pass
    next();
  } catch (error) {
    console.error("❌ Validation middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Input validation failed",
      error: error.message
    });
  }
};

module.exports = {
  openPapersAuth,
  validateOpenPaperInput
};