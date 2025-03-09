const EndQuestion = require('../models/EndQuestion');
const fs = require('fs');
const path = require('path');

class EndQuestionController {
  // Get questions for a specific subject and part
  static async getQuestionsBySubjectAndPart(req, res) {
    try {
      console.log('Received query:', req.query);

      const { 
        subjectCode, 
        part,
        bloomLevel,
        unit
      } = req.query;

      // Validate input
      if (!subjectCode) {
        console.log('No subject code provided');
        return res.status(400).json({ 
          message: 'Subject code is required' 
        });
      }

      // Build query
      const query = { 
        subjectCode: subjectCode
      };
      
      // Add part filter if specified
      if (part) query.part = part;

      // Optional filters
      if (bloomLevel) query.bloomLevel = bloomLevel;
      if (unit) query.unit = unit;

      console.log('Database query:', query);

      // Fetch questions
      const questions = await EndQuestion.find(query).lean();
      
      console.log('Found questions:', questions.length);

      // Process questions to add imageUrl field for client-side rendering
      const processedQuestions = questions.map(q => {
        const result = { ...q };
        
        // Add imageUrl for front-end if question has an image
        if (q.image?.data || q.imageUrl) {
          result.hasImage = true;
          
          // If it's a URL, use it directly
          if (q.imageUrl) {
            result.imageUrl = q.imageUrl;
          } else if (q.image?.data) {
            // For Buffer images, provide the API endpoint
            result.imageUrl = `/api/endsem-questions/questions/${q._id}/image`;
          }
        } else {
          result.hasImage = false;
        }
        
        return result;
      });

      res.status(200).json({
        total: processedQuestions.length,
        subject: {
          code: subjectCode
        },
        questions: processedQuestions
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({
        message: 'Error fetching questions',
        error: error.message
      });
    }
  }


  
  // Create a new question
// Update the createQuestion method in EndSemQuestionController.js

static async createQuestion(req, res) {
  try {
    console.log('Creating question with body:', req.body);
    console.log('File:', req.file);

    const { 
      subjectCode, 
      part,
      question,
      bloomLevel,
      unit,
      marks = 2,
      imageUrl, // Changed from 'image' to 'imageUrl' for clarity
      questionType = 'text',
      options
    } = req.body;

    // Validation
    if (!subjectCode || !part || !question || !bloomLevel || !unit) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['subjectCode', 'part', 'question', 'bloomLevel', 'unit'],
        received: req.body
      });
    }

    // Prepare question data
    const questionData = {
      subjectCode,
      part,
      question,
      bloomLevel,
      unit,
      questionType,
      marks: parseInt(marks) || 2
    };

    // Add MCQ options if present
    if (questionType === 'mcq' && options) {
      try {
        questionData.options = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (e) {
        console.warn('Error parsing options:', e);
      }
    }

    // Handle image URL from request body (explicitly check both imageUrl and image fields)
    if (imageUrl) {
      console.log('Using provided image URL:', imageUrl);
      questionData.imageUrl = imageUrl;
    } else if (req.body.image) {
      console.log('Using provided image field:', req.body.image);
      questionData.imageUrl = req.body.image;
    }

    // Handle file upload
    if (req.file) {
      console.log('Processing uploaded file:', req.file.path);
      
      // Read file as binary buffer
      const imageBuffer = fs.readFileSync(req.file.path);
      
      // Store image data
      questionData.image = {
        data: imageBuffer,
        contentType: req.file.mimetype
      };
      
      // Remove temporary file
      fs.unlinkSync(req.file.path);
    }

    console.log('Saving question with data:', {
      ...questionData,
      image: questionData.image ? 'Image data present' : 'No image',
      imageUrl: questionData.imageUrl || 'No image URL'
    });

    // Create and save new question
    const newQuestion = new EndQuestion(questionData);
    await newQuestion.save();

    console.log('Question saved successfully with ID:', newQuestion._id);

    // Prepare response - add imageUrl for client
    const responseQuestion = newQuestion.toObject();
    
    if (newQuestion.image?.data) {
      responseQuestion.imageUrl = `/api/endsem-questions/questions/${newQuestion._id}/image`;
      responseQuestion.hasImage = true;
    } else if (newQuestion.imageUrl) {
      responseQuestion.hasImage = true;
    } else {
      responseQuestion.hasImage = false;
    }

    res.status(201).json({
      message: 'Question created successfully',
      question: responseQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      message: 'Error creating question',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

  // Update a question
  static async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Find existing question
      const question = await EndQuestion.findById(id);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Update text fields
      if (updateData.subjectCode) question.subjectCode = updateData.subjectCode;
      if (updateData.part) question.part = updateData.part;
      if (updateData.question) question.question = updateData.question;
      if (updateData.bloomLevel) question.bloomLevel = updateData.bloomLevel;
      if (updateData.unit) question.unit = updateData.unit;
      if (updateData.questionType) question.questionType = updateData.questionType;
      if (updateData.marks) question.marks = parseInt(updateData.marks);

      // Handle image URL from request body
      if (updateData.image && !req.file) {
        question.imageUrl = updateData.image;
        // Clear existing buffer image if switching to URL
        question.image = { data: null, contentType: null };
      }

      // Handle file upload
      if (req.file) {
        // Read file as binary buffer
        const imageBuffer = fs.readFileSync(req.file.path);
        
        // Store image data
        question.image = {
          data: imageBuffer,
          contentType: req.file.mimetype
        };
        
        // Clear existing URL if switching to buffer
        question.imageUrl = null;
        
        // Remove temporary file
        fs.unlinkSync(req.file.path);
      }

      // Save updated question
      await question.save();

      // Prepare response - add imageUrl for client
      const responseQuestion = question.toObject();
      
      if (question.image?.data) {
        responseQuestion.imageUrl = `/api/endsem-questions/questions/${question._id}/image`;
        responseQuestion.hasImage = true;
      } else if (question.imageUrl) {
        responseQuestion.hasImage = true;
      } else {
        responseQuestion.hasImage = false;
      }

      res.status(200).json({
        message: 'Question updated successfully',
        question: responseQuestion
      });
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({
        message: 'Error updating question',
        error: error.message
      });
    }
  }

  // Delete a question
  static async deleteQuestion(req, res) {
    try {
      const { id } = req.params;

      const deletedQuestion = await EndQuestion.findByIdAndDelete(id);

      if (!deletedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json({
        message: 'Question deleted successfully',
        question: deletedQuestion
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting question',
        error: error.message
      });
    }
  }

  // Get image for a question
  static async getQuestionImage(req, res) {
    try {
      const { id } = req.params;
      
      // Find the question by ID
      const question = await EndQuestion.findById(id);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      // Handle URL image
      if (question.imageUrl) {
        return res.redirect(question.imageUrl);
      }
      
      // Handle buffer image
      if (question.image && question.image.data) {
        res.set('Content-Type', question.image.contentType || 'image/jpeg');
        return res.send(question.image.data);
      }
      
      // No image found
      return res.status(404).json({ message: 'No image found for this question' });
      
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({
        message: 'Error fetching image',
        error: error.message
      });
    }
  }
  
  // Generate question paper
  static async generateQuestionPaper(req, res) {
    try {
      const { 
        subjectCode, 
        totalMarks,
        questionDistribution 
      } = req.body;

      // Validate input
      if (!subjectCode || !totalMarks || !questionDistribution) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Prepare question paper generation logic
      const questionPaper = [];
      let currentMarks = 0;

      // Generate questions based on distribution
      for (const [bloomLevel, distribution] of Object.entries(questionDistribution)) {
        // Skip if count is 0
        if (!distribution.count) continue;
        
        const questions = await EndQuestion.find({
          subjectCode,
          bloomLevel
        }).lean();

        // Sort questions by complexity
        questions.sort((a, b) => {
          const complexityOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          const aComplexity = a.complexity || 'medium';
          const bComplexity = b.complexity || 'medium';
          return complexityOrder[aComplexity] - complexityOrder[bComplexity];
        });

        // Select questions based on count
        const selectedQuestions = questions.slice(0, distribution.count);
        
        // Process questions to add imageUrl field for client-side rendering
        const processedQuestions = selectedQuestions.map(q => {
          const result = { ...q };
          
          // Add imageUrl for front-end if question has an image
          if (q.image?.data || q.imageUrl) {
            result.hasImage = true;
            
            // If it's a URL, use it directly
            if (q.imageUrl) {
              result.imageUrl = q.imageUrl;
            } else if (q.image?.data) {
              // For Buffer images, provide the API endpoint
              result.imageUrl = `/api/endsem-questions/questions/${q._id}/image`;
            }
          } else {
            result.hasImage = false;
          }
          
          return result;
        });
        
        questionPaper.push(...processedQuestions);
        
        // Calculate marks
        const selectedMarks = processedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
        currentMarks += selectedMarks;
      }

      res.status(200).json({
        subjectCode,
        totalMarks,
        currentMarks,
        remainingMarks: totalMarks - currentMarks,
        questionPaper
      });
    } catch (error) {
      console.error('Error generating question paper:', error);
      res.status(500).json({
        message: 'Error generating question paper',
        error: error.message
      });
    }
  }
}

module.exports = EndQuestionController;