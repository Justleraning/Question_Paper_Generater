const express = require('express');
const router = express.Router();
const EndSemQuestionController = require('../controllers/EndSemQuestionController');
const Upload = require('../middlewares/MulterUpload');

// GET all questions
router.get(
  '/', 
  EndSemQuestionController.getQuestionsBySubjectAndPart
);

// CREATE a new question (with optional file upload)
router.post(
  '/questions', 
  Upload.single('questionImage'),
  EndSemQuestionController.createQuestion
);

// UPDATE a specific question
router.put(
  '/questions/:id', 
  Upload.single('questionImage'),
  EndSemQuestionController.updateQuestion
);

// DELETE a specific question
router.delete(
  '/questions/:id', 
  EndSemQuestionController.deleteQuestion
);

// GENERATE question paper
router.post(
  '/generate-paper',
  EndSemQuestionController.generateQuestionPaper
);

module.exports = router;