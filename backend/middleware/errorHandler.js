// File: backend/middleware/errorHandler.js

// This is our global error handler
// It catches any error thrown anywhere in our app
// (req, res, next) are Express parameters - always the same for middleware
// The extra 'err' parameter at the start is what makes Express know this is an ERROR handler

const errorHandler = (err, req, res, next) => {
  // Sometimes an error comes with a status code, sometimes not
  // If status code exists use it, otherwise use 500 (Internal Server Error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  // Set the response status code
  res.status(statusCode);

  // Send back a JSON response with error details
  res.json({
    success: false,
    message: err.message,

    // Only show the full error details during development
    // In production, hide the stack trace from users
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Export so server.js can use it
module.exports = errorHandler;
