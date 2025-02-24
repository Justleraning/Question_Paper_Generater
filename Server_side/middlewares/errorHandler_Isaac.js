const errorHandler = (err, req, res, next) => {
    // Set a default status code (500 for server error)
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
    // Send error response
    res.status(statusCode).json({
      message: err.message,
      // Include stack trace in development mode only
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };
  
  module.exports = errorHandler;
  