const Question = require("../models/Question");
const { v4: uuidv4 } = require('uuid'); // You'll need to install this package

// ✅ Save a new question
// Updated saveQuestion function
const saveQuestion = async (req, res) => {
  try {
    console.log("🛠️ Full request body received at backend:", JSON.stringify(req.body, null, 2));

    const { courseName, subject, question, options, correctOption, index, questionId } = req.body;

    // ✅ Validate incoming request (check if fields exist)
    if (!courseName || !subject || !question || !options || correctOption === undefined) {
      console.warn("⚠️ Validation Failed! Missing fields in request.");
      console.warn("Missing fields:", { 
        courseName: !courseName, 
        subject: !subject, 
        question: !question, 
        options: !options, 
        correctOption: correctOption === undefined 
      });
      return res.status(400).json({ error: "⚠️ All fields are required!" });
    }

    // ✅ Validate correctOption is a number between 0-3
    const validCorrectOption = Number(correctOption);
    if (isNaN(validCorrectOption) || validCorrectOption < 0 || validCorrectOption > 3) {
      console.warn(`⚠️ Invalid correctOption value: ${correctOption}`);
      return res.status(400).json({ error: "⚠️ Correct option must be between 0-3!" });
    }

    // ✅ Add this before saving to prevent invalid options
    if (!Array.isArray(options) || options.length < 2 || options.some(opt => !opt.value.trim())) {
      console.warn("⚠️ Validation Failed: Options must have at least two valid entries!");
      return res.status(400).json({ error: "⚠️ At least two options with valid text are required!" });
    }

    // If questionId is provided, we're updating an existing question
    if (questionId) {
      console.log(`🔍 Checking if question with ID ${questionId} exists...`);
      const existingQuestion = await Question.findOne({ questionId });

      if (existingQuestion) {
        console.log(`🔄 Updating existing question with ID ${questionId}`);
        existingQuestion.question = question;
        existingQuestion.options = options;
        existingQuestion.correctOption = validCorrectOption; // Using validated number
        existingQuestion.courseName = courseName;
        existingQuestion.subject = subject;
        if (index !== undefined) existingQuestion.index = index;
        
        console.log("💾 Saving updated question...");
        await existingQuestion.save();
        
        console.log("✅ Question updated successfully!");
        return res.status(200).json({ message: "✅ Question updated successfully!", question: existingQuestion });
      }
    }

    // Generate a new questionId if not provided or not found
    const newQuestionId = questionId || `q-${uuidv4()}`;
    
    console.log("🆕 Creating new question with ID:", newQuestionId);
    const newQuestion = new Question({
      questionId: newQuestionId,
      courseName,
      subject,
      question,
      options,
      correctOption: validCorrectOption, // Using validated number
      index, // Keep index for backward compatibility
    });

    console.log("💾 Saving new question...");
    await newQuestion.save();
    console.log("✅ New question saved successfully!");

    res.status(201).json({ message: "✅ Question saved successfully!", question: newQuestion });

  } catch (error) {
    console.error("❌ Internal Server Error while saving question:", error);
    res.status(500).json({ error: "❌ Failed to save question", details: error.message });
  }
};


// ✅ Fetch Questions by Course (Categorized into Subjects)
const fetchQuestionsByCourse = async (req, res) => {
  const { course } = req.query;

  if (!course) {
    return res.status(400).json({ error: "⚠️ Course name is required!" });
  }

  try {
    const questionPool = {
      LogicalReasoning: await Question.find({ courseName: course, subject: "Logical Reasoning" }).limit(15),
      QuantitativeAptitude: await Question.find({ courseName: course, subject: "Quantitative Aptitude" }).limit(15),
      English: await Question.find({ courseName: course, subject: "English" }).limit(10),
      Custom: await Question.find({ courseName: course, subject: "Custom" }).limit(10),
    };

    res.status(200).json({ message: "✅ Questions fetched successfully!", questionPool });
  } catch (error) {
    console.error("❌ Error fetching questions by course:", error);
    res.status(500).json({ error: "❌ Server error while fetching questions" });
  }
};

// ✅ Get a specific question by questionId
const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.query;
    console.log(`🔍 Fetching question with ID ${questionId}`);

    if (!questionId) {
      console.error("❌ Missing parameter: questionId");
      return res.status(400).json({ error: "⚠️ Question ID is required!" });
    }

    const question = await Question.findOne({ questionId });

    if (!question) {
      console.warn(`⚠️ No question found with ID ${questionId}.`);
      return res.status(404).json({ message: "⚠️ No question exists with this ID." });
    }

    console.log(`✅ Found question with ID ${questionId}:`, question);
    res.status(200).json({
      questionId: question.questionId,
      question: question.question,
      options: question.options,
      correctOption: question.correctOption,
      courseName: question.courseName,
      subject: question.subject
    });
  } catch (error) {
    console.error("❌ Error fetching question:", error);
    res.status(500).json({ error: "❌ Failed to fetch question" });
  
  }
};

const getAllQuestions = async (req, res) => {
  const { courseName, subject } = req.query;

  if (!courseName || !subject) {
    return res.status(400).json({ error: "Course name and subject are required!" });
  }

  try {
    const questions = await Question.find({ 
      courseName, 
      subject 
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Server error while fetching questions" });
  }
};



// ✅ Export Only the Needed Functions
module.exports = { saveQuestion, fetchQuestionsByCourse, getQuestionById , getAllQuestions};