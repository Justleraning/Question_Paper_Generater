const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
  courseName: { 
    type: String, 
    required: true
  },
  customSubjectName: { 
    type: String
  },
  totalMarks: { 
    type: Number, 
    required: true
  },
  examTime: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: String, 
    required: true
  },
  status: {
    type: String,
    enum: ['Not Sent', 'Pending Approval', 'Approved', 'Rejected'],
    default: 'Not Sent'
  },
  reviewComments: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedOn: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    subject: String,
    question: String,
    options: [{
      type: { type: String, default: 'Text' },
      value: String
    }],
    correctOption: Number,
    index: Number,
    marks: { type: Number, default: 1 }
  }]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Paper', paperSchema);