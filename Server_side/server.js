require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./middlewares/errorHandler"); // Unified Error Handler

// Initialize Express App
const app = express();

// CORS Configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for large HTML payloads
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

// Define Question Paper Schema
const questionSchema = new mongoose.Schema({
  semester: String,
  subject: String,
  units: [String],
  questions: [
    {
      text: String,
      marks: Number,
      image: String, 
      unit: String,
    },
  ],
});

const QuestionPaper = mongoose.model("QuestionPaper", questionSchema);

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const paperRoutes = require("./routes/paperRoutes");
const courseRoutes = require("./routes/CourseRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const unitRoutes = require("./routes/unitRoutes");
const questionRoutesIsaac = require("./routes/questionRoutes_Isaac");
const randomizationRoutes = require("./routes/randomizationRoutes");
const endSemQuestionRoutes = require("./routes/EndSemQuestionRoutes"); // Added EndSem Question Routes
const endPapersRoutes = require("./routes/EndPapersRoutes");
const openPapersRoutes = require("./routes/OpenPaperRoutes"); // Added OpenPaper Routes
const { endPapersAuth } = require('./middlewares/EndPapersMiddleware');

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

// Additional Question Paper Routes
// ✅ Route: Save Questions
app.post("/save-questions", async (req, res) => {
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

    const newPaper = new QuestionPaper({ semester, subject, units, questions: formattedQuestions });
    await newPaper.save();
    console.log("✅ Questions saved successfully");

    res.status(201).json({ message: "Questions saved successfully" });
  } catch (error) {
    console.error("❌ Error saving questions:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Route: Get All Question Papers
app.get("/get-questions", async (req, res) => {
  try {
    console.log("📌 Fetching all question papers...");

    const papers = await QuestionPaper.find();
    res.status(200).json(papers);
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ✅ Route: Get a Single Question Paper by ID
app.get("/get-questions/:id", async (req, res) => {
  try {
    console.log("📌 Fetching paper with ID:", req.params.id);
    
    const paper = await QuestionPaper.findById(req.params.id);
    
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json(paper);
  } catch (error) {
    console.error("❌ Error fetching paper:", error);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// ✅ Route: Randomize Questions
app.post("/api/questions/randomize", async (req, res) => {
  try {
    const { subject } = req.body;
    const papers = await QuestionPaper.find({ subject });

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
});

// ✅ Route: Delete Paper
app.delete("/delete-paper/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑 Deleting paper with ID: ${id}`);

    const deletedPaper = await QuestionPaper.findByIdAndDelete(id);
    if (!deletedPaper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    console.log("✅ Paper deleted successfully");
    res.json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting paper:", error);
    res.status(500).json({ error: "Server error while deleting paper" });
  }
});

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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));