const Question = require("../models/Question");

// ✅ Save a new question
const saveQuestion = async (req, res) => {
  try {
    console.log("🛠️ Full request body received at backend:", JSON.stringify(req.body, null, 2));

    const { courseName, subject, question, options, correctOption, index } = req.body;

    // ✅ Validate incoming request
    if (!courseName || !subject || !question || !options || !correctOption || index === undefined) {
      console.warn("⚠️ Validation Failed! Missing fields in request.");
      return res.status(400).json({ error: "⚠️ All fields are required!" });
    }

    // ✅ Add this before saving to prevent invalid options
    if (!Array.isArray(options) || options.length < 2 || options.some(opt => !opt.value.trim())) {
      console.warn("⚠️ Validation Failed: Options must have at least two valid entries!");
      return res.status(400).json({ error: "⚠️ At least two options with valid text are required!" });
    }

    console.log(`🔍 Checking if question already exists at index ${index}...`);
    const existingQuestion = await Question.findOne({ courseName, subject, index });

    if (existingQuestion) {
      console.log(`🔄 Updating existing question at index ${index}`);
      existingQuestion.question = question;
      existingQuestion.options = options;
      existingQuestion.correctOption = correctOption;
      
      console.log("💾 Saving updated question...");
      await existingQuestion.save();
      
      console.log("✅ Question updated successfully!");
      return res.status(200).json({ message: "✅ Question updated successfully!", question: existingQuestion });
    }

    console.log("🆕 No existing question found. Creating new question...");
    const newQuestion = new Question({
      courseName,
      subject,
      question,
      options,
      correctOption,
      index,
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

// ✅ Get a specific question by index
const getQuestionByIndex = async (req, res) => {
  try {
    const { courseName, subject, index } = req.query;
    console.log(`🔍 Fetching question at index ${index} for course "${courseName}" and subject "${subject}"`);

    if (!courseName || !subject || index === undefined) {
      console.error("❌ Missing parameters:", { courseName, subject, index });
      return res.status(400).json({ error: "⚠️ Course name, subject, and index are required!" });
    }

    const question = await Question.findOne({ courseName, subject, index });

    if (!question) {
      console.warn(`⚠️ No question found at index ${index}.`);
      return res.status(200).json({ message: "⚠️ No question exists at this index." });
    }

    console.log(`✅ Found question at index ${index}:`, question);
    res.status(200).json({
      question: question.question,
      options: question.options,
      correctOption: question.correctOption,
    });
  } catch (error) {
    console.error("❌ Error fetching question:", error);
    res.status(500).json({ error: "❌ Failed to fetch question" });
  }
};



// ✅ Export Only the Needed Functions
module.exports = { saveQuestion, fetchQuestionsByCourse, getQuestionByIndex };
