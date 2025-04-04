const mongoose = require('mongoose');

// Define a schema for individual question items
const questionItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  marks: { type: Number, required: true },
  image: { type: String, default: null },
  unit: { type: String }
});

// Main schema for the question paper
const questionSchema = new mongoose.Schema({
  // Basic fields required by existing system
  text: { type: String, required: true },
  marks: { type: Number, required: true },
  subject: { type: String, required: true },
  unit: { type: String, required: true }, // Keep for compatibility
  units: [{ type: String }], // Add an array of units
  semester: { type: String, required: true },
  questions: [questionItemSchema],
  
  // Paper approval workflow fields
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // User relations
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Submission info
  submittedAt: Date,
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Approval info
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Rejection info
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
});

// Pre-save middleware to update the 'updatedAt' timestamp
questionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Question = mongoose.model('midQuestion', questionSchema);

module.exports = Question;