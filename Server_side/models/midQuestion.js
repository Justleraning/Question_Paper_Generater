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
  text: { type: String, required: true },
  marks: { type: Number, required: true },
  subject: { type: String, required: true },
  unit: { type: String, required: true }, // Keep for compatibility
  units: [{ type: String }], // Add an array of units
  semester: { type: String, required: true },
  questions: [questionItemSchema]
});

const Question = mongoose.model('midQuestion', questionSchema);

module.exports = Question;