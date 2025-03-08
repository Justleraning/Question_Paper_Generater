const EndQuestion = require('../models/EndQuestion');

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
        subjectCode: subjectCode,
        part: part || 'A' // Default to Part A if not specified
      };

      // Optional filters
      if (bloomLevel) query.bloomLevel = bloomLevel;
      if (unit) query.unit = unit;

      console.log('Database query:', query);

      // Fetch questions
      const questions = await EndQuestion.find(query).lean();
      
      console.log('Found questions:', questions.length);

      res.status(200).json({
        total: questions.length,
        subject: {
          code: subjectCode
        },
        questions
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
      const { 
        subjectCode, 
        part,
        question,
        bloomLevel,
        unit,
        questionType,
        options,
        marks,
        complexity
      } = req.body;

      // Prepare question data
      const questionData = {
        subjectCode,
        part,
        question,
        bloomLevel,
        unit,
        questionType: questionType || 'text',
        marks: marks || 0,
        complexity: complexity || 'medium'
      };

      // Add optional fields
      if (questionType === 'mcq') {
        questionData.options = options;
      }

      // Handle file uploads
      if (req.file) {
        questionData.image = req.file.path;
      }

      // Create and save new question
      const newQuestion = new EndQuestion(questionData);
      await newQuestion.save();

      res.status(201).json({
        message: 'Question created successfully',
        question: newQuestion
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error creating question',
        error: error.message
      });
    }
  }

  // Update a question
  static async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Handle file upload if present
      if (req.file) {
        updateData.image = req.file.path;
      }

      const updatedQuestion = await EndQuestion.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      );

      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json({
        message: 'Question updated successfully',
        question: updatedQuestion
      });
    } catch (error) {
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

  // Generate question paper
  static async generateQuestionPaper(req, res) {
    try {
      const { 
        subjectCode, 
        totalMarks,
        questionDistribution 
      } = req.body;

      // Prepare question paper generation logic
      const questionPaper = [];
      let remainingMarks = totalMarks;

      // Generate questions based on distribution
      for (const [bloomLevel, distribution] of Object.entries(questionDistribution)) {
        const questions = await EndQuestion.find({
          subjectCode,
          bloomLevel
        }).lean();

        // Sort questions by complexity and select appropriate ones
        questions.sort((a, b) => {
          const complexityOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          return complexityOrder[a.complexity] - complexityOrder[b.complexity];
        });

        // Select questions based on marks and distribution
        const selectedQuestions = questions.slice(0, distribution.count);
        questionPaper.push(...selectedQuestions);
        
        remainingMarks -= selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
      }

      res.status(200).json({
        subjectCode,
        totalMarks,
        questionPaper,
        remainingMarks
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error generating question paper',
        error: error.message
      });
    }
  }
}

module.exports = EndQuestionController;