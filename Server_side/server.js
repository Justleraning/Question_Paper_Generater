require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middlewares/errorHandler");

// Initialize Express App
const app = express();

// CORS configuration with proper methods allowed
app.use(cors({
  origin: ['http://localhost:3000', 'your-production-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log Incoming Requests
app.use((req, res, next) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});

// Import Models
const Question = require("./models/midQuestion");
const QuestionPaper_midsem = require("./models/QuestionPaper_midsem");

// Controller functions for direct routes
// ✅ Get questions by paper ID
const getQuestionsByPaperId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Getting paper with ID:", id);
    
    const paper = await Question.findById(id);
    
    if (!paper) {
      console.log("Paper not found with ID:", id);
      return res.status(404).json({ message: 'Paper not found' });
    }
    
    console.log("Paper found:", paper);
    res.json(paper);
  } catch (error) {
    console.error("Error in getQuestionsByPaperId:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Create/Save Paper
const createPaper = async (req, res) => {
  try {
    console.log("📥 Received paper data:", JSON.stringify(req.body, null, 2));
    
    const { subject, semester, questions } = req.body;
    
    // Validate input
    if (!subject || !semester || !questions || questions.length === 0) {
      console.log("❌ Validation failed: Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Pre-process questions to ensure they meet schema requirements
    const processedQuestions = questions.filter(q => {
      // Filter out questions without text
      if (!q.text || q.text.trim() === '') {
        console.log("⚠️ Skipping question with empty text");
        return false;
      }
      return true;
    }).map(q => ({
      text: q.text,
      marks: parseInt(q.marks) || 2, // Ensure marks is a number
      image: q.image || null,
      unit: q.unit || "Default Unit" // Ensure unit is present
    }));
    
    if (processedQuestions.length === 0) {
      console.log("❌ No valid questions after filtering");
      return res.status(400).json({ message: 'No valid questions provided' });
    }
    
    console.log(`✅ Validation passed. Processing ${processedQuestions.length} questions...`);
    
    // Create new paper with the required fields at the top level AND in the questions
    const newPaper = new Question({
      text: `${subject} - ${semester}`, // Add required field at root level
      marks: 100, // Add required field at root level
      subject: subject, // Add subject at root level (required)
      semester: semester, // Add semester at root level (required)
      unit: processedQuestions[0].unit || "Default Unit", // Add unit at root level (required)
      questions: processedQuestions // Add questions as before
    });
    
    console.log("📋 Paper object created:", JSON.stringify(newPaper, null, 2));
    
    // Save paper
    const savedPaper = await newPaper.save();
    console.log("💾 Paper saved successfully with ID:", savedPaper._id);
    res.status(201).json(savedPaper);
  } catch (error) {
    console.error("❌❌❌ Error in createPaper:", error);
    
    // Check for MongoDB validation errors
    if (error.name === 'ValidationError') {
      // Handle validation errors more specifically
      const validationErrors = Object.keys(error.errors).map(key => {
        return `${key}: ${error.errors[key].message}`;
      });
      
      return res.status(400).json({ 
        error: error.message,
        validationErrors
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Route Handlers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/questions-isaac", questionRoutesIsaac);
app.use("/api/papers", paperRoutes);
app.use("/api", paperRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/randomize", randomizationRoutes);
app.use("/api/endsem-questions", endSemQuestionRoutes); // Added EndSem Question Routes
app.use("/api/endpapers", endPapersRoutes);
app.use("/api/openpapers", openPapersRoutes); // Added OpenPaper Routes
// ✅ Randomize questions
const randomizeQuestions = async (req, res) => {
  try {
    const { subject } = req.body;
    const questions = await Question.find({ subject });
    
    if (questions.length < 19) {
      return res.status(400).json({ message: 'Not enough questions to randomize.' });
    }
    
    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    res.json({ subject, questions: shuffledQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete paper
const deletePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPaper = await Question.findByIdAndDelete(id);
    
    if (!deletedPaper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    
    res.json({ message: 'Paper deleted successfully', deletedPaper });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Send for approval (mock)
const sendForApproval = async (req, res) => {
  try {
    // Mock action - You can implement actual logic
    res.json({ message: 'Paper sent for approval' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ createdAt: -1 });
    console.log(`Found ${questions.length} papers`);
    res.json(questions);
  } catch (error) {
    console.error("Error in getAllQuestions:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Save questions (for QuestionPaper_midsem)
const saveQuestions = async (req, res) => {
  try {
    console.log("📥 Received request:", req.body);
    const { semester, subject, units, questions } = req.body;

    if (!semester || !subject || !units.length || !Object.keys(questions).length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert questions object into an array
    const formattedQuestions = Object.entries(questions).flatMap(([unit, qList]) =>
      qList.map(q => ({ ...q, unit })) 
    );

    console.log("📥 Saving Data to MongoDB:", JSON.stringify(formattedQuestions, null, 2));

    const newPaper = new QuestionPaper_midsem({ semester, subject, units, questions: formattedQuestions });
    await newPaper.save();
    console.log("✅ Questions saved successfully");

    res.status(201).json({ message: "Questions saved successfully", paper: newPaper });
  } catch (error) {
    console.error("❌ Error saving questions:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all question papers (for QuestionPaper_midsem)
const getAllQuestionPapers = async (req, res) => {
  try {
    console.log("📌 Fetching all question papers...");

    const papers = await QuestionPaper_midsem.find().sort({ createdAt: -1 });
    res.status(200).json(papers);
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

// ✅ Get question paper by ID (for QuestionPaper_midsem)
const getQuestionPaperById = async (req, res) => {
  try {
    console.log("📌 Fetching paper with ID:", req.params.id);
    
    const paper = await QuestionPaper_midsem.findById(req.params.id);
    
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json(paper);
  } catch (error) {
    console.error("❌ Error fetching paper:", error);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
};

// ✅ Randomize questions (for QuestionPaper_midsem)
const randomizeQuestionPaper = async (req, res) => {
  try {
    const { subject } = req.body;
    const papers = await QuestionPaper_midsem.find({ subject });

    if (!papers.length) {
      return res.status(404).json({ error: "No questions available for this subject" });
    }

    // Pick a random paper
    const selectedPaper = papers[Math.floor(Math.random() * papers.length)];

    // Separate 2-mark and 4-mark questions
    const twoMarkQuestions = selectedPaper.questions.filter(q => q.marks === 2);
    const fourMarkQuestions = selectedPaper.questions.filter(q => q.marks === 4);

    // Shuffle them separately
    twoMarkQuestions.sort(() => Math.random() - 0.5);
    fourMarkQuestions.sort(() => Math.random() - 0.5);

    // Ensure correct structure: Select only the needed number of questions
    selectedPaper.questions = [
      ...twoMarkQuestions.slice(0, 5),  // Take first 5 from shuffled 2-mark questions
      ...fourMarkQuestions.slice(0, 5), // Take first 5 from shuffled 4-mark questions
    ];

    res.json(selectedPaper);
  } catch (error) {
    console.error("❌ Error randomizing questions:", error);
    res.status(500).json({ error: "Failed to randomize questions" });
  }
};

// ✅ Delete paper (for QuestionPaper_midsem)
const deleteQuestionPaper = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑 Deleting paper with ID: ${id}`);

    const deletedPaper = await QuestionPaper_midsem.findByIdAndDelete(id);
    if (!deletedPaper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    console.log("✅ Paper deleted successfully");
    res.json({ message: "Paper deleted successfully", deletedPaper });
  } catch (error) {
    console.error("❌ Error deleting paper:", error);
    res.status(500).json({ error: "Server error while deleting paper" });
  }
};

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const paperRoutes = require("./routes/paperRoutes");
const courseRoutes = require("./routes/courseRoutes"); // Fixed case to match file
const subjectRoutes = require("./routes/subjectRoutes");
const unitRoutes = require("./routes/unitRoutes");
const questionRoutesIsaac = require("./routes/questionRoutes_Isaac");
const randomizationRoutes = require("./routes/randomizationRoutes");
const endSemQuestionRoutes = require("./routes/EndSemQuestionRoutes");
const endPapersRoutes = require("./routes/EndPapersRoutes");
const openPapersRoutes = require("./routes/OpenPaperRoutes");
const midquestions = require("./routes/midquestions");
const questionsmidsem = require("./routes/questionsmidsem");
const { endPapersAuth } = require('./middlewares/EndPapersMiddleware');

// Route Handlers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/questions-isaac", questionRoutesIsaac);
app.use("/api/papers", paperRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/randomize", randomizationRoutes);
app.use("/api/endsem-questions", endSemQuestionRoutes);
app.use("/api/endpapers", endPapersRoutes);
app.use("/api/openpapers", openPapersRoutes);
app.use("/api/midquestions", midquestions);
app.use("/api/questionsmidsem", questionsmidsem);

// Direct routes using the controller functions defined above
app.get('/get-questions/:id', getQuestionsByPaperId);
app.post('/api/papers/save', createPaper);
app.post('/api/questions/randomize', randomizeQuestions);
app.delete('/delete-paper/:id', deletePaper);
app.post('/api/papers/send-for-approval', sendForApproval);
app.get('/get-questions', getAllQuestions);

// QuestionPaper_midsem routes
app.post("/api/question-papers/save", saveQuestions);
app.get("/api/question-papers", getAllQuestionPapers);
app.get("/api/question-papers/:id", getQuestionPaperById);
app.post("/api/question-papers/randomize", randomizeQuestionPaper);
app.delete("/api/question-papers/:id", deleteQuestionPaper);

// Error handling middleware
app.use(errorHandler);

// Serve Frontend in Production Mode
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Serving Frontend in Production Mode...");
  const frontendPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));
  
  // Serve React index.html for any unknown route
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;