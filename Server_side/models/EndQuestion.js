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
    enum: ['Remember L1', 'Understand L1', 'Apply L2', 'Analyze L2', 'Evaluate L3', 'Create L3'],
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
  
  // Image - can be a string URL or a buffer object
  image: {
    data: Buffer,
    contentType: String
  },
  
  // Image URL field (separate from buffer)
  imageUrl: {
    type: String,
    default: null
  },
  
  // Marks for the question
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
    default: 2
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
  // Enable virtuals in JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound indexes for efficient querying
EndQuestionSchema.index({ subjectCode: 1, part: 1 });
EndQuestionSchema.index({ bloomLevel: 1 });
EndQuestionSchema.index({ unit: 1 });

// Virtual for question complexity based on marks
EndQuestionSchema.virtual('complexity').get(function() {
  if (this.marks <= 2) return 'easy';
  if (this.marks <= 4) return 'medium';
  return 'hard';
});

// Virtual to check if the question has an image
EndQuestionSchema.virtual('hasImage').get(function() {
  return !!(this.image?.data || this.imageUrl);
});

const EndQuestion = mongoose.model('EndQuestion', EndQuestionSchema);

module.exports = EndQuestion;