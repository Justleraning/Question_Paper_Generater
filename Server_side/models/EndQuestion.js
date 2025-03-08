const mongoose = require('mongoose');

const EndQuestionSchema = new mongoose.Schema({
  // Subject Information
  subjectCode: {
    type: String,
    required: true,
    trim: true
  },
  
  // Exam Part
  part: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: true
  },
  
  // Question Text
  question: {
    type: String,
    required: true,
    trim: true
  },
  
  // Bloom's Taxonomy Level
  bloomLevel: {
    type: String,
    enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
    required: true
  },
  
  // Course Unit
  unit: {
    type: String,
    required: true,
    enum: ['1', '2', '3', '4', '5']
  },
  
  // Question Type
  questionType: {
    type: String,
    enum: ['text', 'mcq', 'mcq-image', 'coding', 'diagram'],
    default: 'text'
  },
  
  // Options for MCQ
  options: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Correct Option Index for MCQ
  correctOption: {
    type: Number,
    default: null
  },
  
  // Optional Image
  image: {
    type: String,
    default: null
  },
  
  // Marks for the question
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  
  // Additional metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Optional full text or detailed explanation
  fullText: {
    type: String,
    default: null
  }
}, {
  // Add indexes for efficient querying
  indexes: [
    { subjectCode: 1, part: 1 },
    { bloomLevel: 1 },
    { unit: 1 }
  ]
});

// Create a compound index for subject and part
EndQuestionSchema.index({ subjectCode: 1, part: 1 });

// Virtual for question complexity based on marks
EndQuestionSchema.virtual('complexity').get(function() {
  if (this.marks <= 2) return 'Easy';
  if (this.marks <= 4) return 'Medium';
  return 'Hard';
});

// Middleware to validate options for MCQ
EndQuestionSchema.pre('save', function(next) {
  if (this.questionType === 'mcq' || this.questionType === 'mcq-image') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('MCQ must have at least two options'));
    }
    
    if (this.correctOption === null || this.correctOption < 0 || 
        this.correctOption >= this.options.length) {
      return next(new Error('Invalid correct option'));
    }
  }
  next();
});

const EndQuestion = mongoose.model('EndQuestion', EndQuestionSchema);

module.exports = EndQuestion;