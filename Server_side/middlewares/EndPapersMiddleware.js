const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Custom middleware for EndPapers routes that allows operation without authentication
 * but still attaches user information if available
 */
const endPapersAuth = async (req, res, next) => {
  try {
    let token;
    
    // Check if there's an authorization header with Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token
      token = req.headers.authorization.split(' ')[1];
      
      // If we have a token, try to get a user
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          // Verify token to get user ID
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          
          // Find user by ID
          const user = await User.findById(decoded.id)
            .select('_id role')
            .lean();
          
          if (user) {
            req.user = {
              _id: user._id,
              role: user.role
            };
            console.log('User authenticated:', user.role);
          }
        } catch (verificationError) {
          // Detailed error logging for token verification
          if (verificationError.name === 'TokenExpiredError') {
            console.log('Token has expired');
          } else if (verificationError.name === 'JsonWebTokenError') {
            console.log('Invalid token structure');
          } else {
            console.log('Token verification failed:', verificationError.message);
          }
        }
      }
    }
    
    // Always ensure a user object exists
    if (!req.user) {
      req.user = {
        _id: new mongoose.Types.ObjectId('000000000000000000000000'),
        role: 'teacher'
      };
      
      console.log('Using fallback user for endpapers route');
    }
    
    // Continue with the request
    next();
  } catch (error) {
    console.error('Unexpected error in endPapersAuth middleware:', error);
    
    // Fallback user in case of any unexpected errors
    req.user = {
      _id: new mongoose.Types.ObjectId('000000000000000000000000'),
      role: 'teacher'
    };
    
    next();
  }
};

/**
 * Middleware to ensure teachers can only access their own papers
 */
const teacherOwnPapersOnly = async (req, res, next) => {
  try {
    // Skip for admins or if user not authenticated
    if (!req.user || req.user.role === 'admin' || req.user.role === 'SuperAdmin') {
      return next();
    }
    
    // For GET, PUT, DELETE requests with a specific paper ID
    if ((req.method === 'GET' || req.method === 'PUT' || req.method === 'DELETE') && req.params.id) {
      try {
        const EndPapers = require('../models/EndPapersModel');
        const paper = await EndPapers.findById(req.params.id);
        
        if (!paper) {
          return res.status(404).json({ 
            success: false, 
            message: 'Paper not found' 
          });
        }
        
        // Check if the user is the creator - now using root level createdBy
        if (paper.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({ 
            success: false, 
            message: 'Not authorized to access this paper' 
          });
        }
      } catch (error) {
        console.error('Error in teacherOwnPapersOnly middleware:', error);
        // Pass to next handler instead of directly returning response
        return next(error);
      }
    }
    
    next();
  } catch (error) {
    console.error('Unexpected error in teacherOwnPapersOnly middleware:', error);
    return next(error);
  }
}; // <-- Note the closing curly brace and semicolon here
  
module.exports = { endPapersAuth, teacherOwnPapersOnly };
  
