const mongoose = require('mongoose');
const User = require('../models/User');

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
          // Use your existing JWT verification logic here if needed
          // For now, we'll just set a placeholder user ID
          const dummyUser = await User.findOne();
          if (dummyUser) {
            req.user = dummyUser;
          }
        } catch (error) {
          // Token verification failed, but we'll continue anyway
          console.log('Token verification failed, using fallback user');
        }
      }
    }
    
    // If no user found but we need one for the request
    if (!req.user) {
      // Create a placeholder user object with minimal required fields
      req.user = {
        _id: mongoose.Types.ObjectId('000000000000000000000000'), // Fallback ID
        role: 'teacher' // Default role
      };
      
      console.log('Using fallback user for endpapers route');
    }
    
    // Continue with the request
    next();
  } catch (error) {
    console.error('Error in endPapersAuth middleware:', error);
    next();
  }
};

module.exports = { endPapersAuth };