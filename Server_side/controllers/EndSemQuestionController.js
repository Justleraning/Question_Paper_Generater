const EndQuestion = require('../models/EndQuestion');
const fs = require('fs');
const path = require('path');

// Define helper functions outside the class
const getBloomLevelName = (bloomIndex) => {
  switch (bloomIndex) {
    case 1:
      return 'Remember L1'; // Level 1: Remember, Understand
    case 2:
      return 'Apply L2';    // Level 2: Apply, Analyze
    case 3:
      return 'Evaluate L3'; // Level 3: Evaluate, Create
    default:
      return 'Remember L1'; // Default to Level 1
  }
};

const shuffleQuestions = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
        imageUrl,
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
        examPattern
      } = req.body;

      // Validate input
      if (!subjectCode) {
        return res.status(400).json({ message: 'Subject code is required' });
      }

      // Build a query based on the exam pattern if provided, or use simple query
      const query = { 
        subjectCode
      };

      let questionPaper = [];
      
      // If examPattern is provided, use it for sophisticated question selection
      if (examPattern && examPattern.parts) {
        const partResults = {};
        
        // Process each part (A, B, C)
        for (const part of examPattern.parts) {
          const partId = part.id; // A, B, or C
          const partQuestions = [];
          
          // Process each unit for this part
          for (let unitIndex = 0; unitIndex < part.questionsByUnit.length; unitIndex++) {
            const unitId = unitIndex + 1;
            const questionsNeeded = part.questionsByUnit[unitIndex];
            
            if (questionsNeeded <= 0) continue;
            
            // For each unit, fetch questions from each bloom level
            for (let bloomIndex = 0; bloomIndex < part.questionsByBloom.length; bloomIndex++) {
              const bloomLevel = getBloomLevelName(bloomIndex + 1);
              const bloomQuestionsNeeded = part.questionsByBloom[bloomIndex];
              
              if (bloomQuestionsNeeded <= 0) continue;
              
              // Calculate questions needed for this combination (approximate distribution)
              const questionsForThisBloom = Math.ceil(questionsNeeded * (bloomQuestionsNeeded / part.maxQuestions));
              
              // Fetch qualifying questions
              const unitQuestions = await EndQuestion.find({
                subjectCode,
                part: partId,
                unit: unitId.toString(),
                bloomLevel
              }).lean();
              
              // Select questions randomly if we have more than needed
              const selectedQuestions = unitQuestions.length <= questionsForThisBloom ? 
                unitQuestions : 
                shuffleQuestions(unitQuestions).slice(0, questionsForThisBloom);
              
              partQuestions.push(...selectedQuestions);
            }
          }
          
          // Limit questions to max questions for this part and randomly select
          let limitedPartQuestions = partQuestions;
          if (partQuestions.length > part.maxQuestions) {
            limitedPartQuestions = shuffleQuestions(partQuestions).slice(0, part.maxQuestions);
          }
          
          // Store in results
          partResults[partId] = limitedPartQuestions;
        }
        
        // Combine all parts into the final question paper
        Object.values(partResults).forEach(partQuestions => {
          questionPaper = questionPaper.concat(partQuestions);
        });
      } else {
        // Fall back to original simple selection logic
        const questions = await EndQuestion.find(query).lean();
        
        // Sort questions by complexity
        questions.sort((a, b) => {
          const complexityOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          const aComplexity = a.complexity || 'medium';
          const bComplexity = b.complexity || 'medium';
          return complexityOrder[aComplexity] - complexityOrder[bComplexity];
        });
        
        // Take a subset of questions
        questionPaper = questions.slice(0, 20); // Default to 20 questions if no specific pattern
      }
      
      // Process questions to add imageUrl field for client-side rendering
      const processedQuestions = questionPaper.map(q => {
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
        subjectCode,
        totalQuestions: processedQuestions.length,
        questionPaper: processedQuestions
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