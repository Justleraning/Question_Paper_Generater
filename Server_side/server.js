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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const endSemQuestionRoutes = require("./routes/EndSemQuestionRoutes"); // Add EndSem Question Routes

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
app.use("/api/endsem-questions", endSemQuestionRoutes); // Add EndSem Question Routes

// Existing routes remain the same...
// (All the previous routes for QuestionPaper remain unchanged)

// Error handling middleware
app.use(errorHandler);

// Serve Frontend in Production Mode
if (process.env.NODE_ENV === "production") {
  console.log("🚀 Serving Frontend in Production Mode...");
  const frontendPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));
  
  // Serve React `index.html` for any unknown route
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));