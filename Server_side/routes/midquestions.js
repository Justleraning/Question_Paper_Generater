const express = require('express');
const router = express.Router();
const midPaper = require('../models/midQuestion'); // Import your Paper model

// Save paper route
router.post('/save', async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body, null, 2));
    
    const { subject, semester, questions } = req.body;
    
    if (!subject || !semester || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Filter out questions with empty text
    const validQuestions = questions.filter(q => q.text && q.text.trim() !== '');
    
    if (validQuestions.length === 0) {
      return res.status(400).json({ message: 'No valid questions provided' });
    }
    
    // Log the structure that we're trying to save
    console.log("About to save paper with structure:", {
      subject,
      semester,
      questionCount: validQuestions.length
    });
    
    // Let's create a separate document for each question
    // This matches the schema requirements
    const savedQuestions = [];
    
    for (const q of validQuestions) {
      // Create a document that matches the schema
      const questionDoc = new midPaper({
        text: q.text.trim(),
        marks: parseInt(q.marks) || 2,
        subject: subject,
        unit: q.unit || "1",
        semester: semester,
        image: q.image || null
      });
      
      // Save each question
      try {
        const savedQuestion = await questionDoc.save();
        savedQuestions.push(savedQuestion);
      } catch (err) {
        console.error("Error saving question:", err);
        // Continue with other questions even if one fails
      }
    }
    
    if (savedQuestions.length === 0) {
      return res.status(500).json({ 
        message: 'Failed to save any questions',
        error: 'Validation errors prevented saving' 
      });
    }
    
    // Return success
    res.status(201).json({ 
      message: 'Paper saved successfully', 
      paper: {
        _id: savedQuestions[0]._id, // Use first question ID as paper ID
        subject,
        semester,
        questions: savedQuestions
      }
    });
  } catch (error) {
    console.error('Error in /save route:', error);
    res.status(500).json({ 
      message: 'Failed to save paper', 
      error: error.message 
    });
  }
});

module.exports = router;