require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const errorHandler = require("./middlewares/errorHandler");

// Initialize Express App
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🔍 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

connectDB();

// Additional Mongoose Configuration
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Import Routes
const routes = {
  auth: require("./routes/authRoutes"),
  users: require("./routes/userRoutes"),
  questions: require("./routes/questionRoutes"),
  papers: require("./routes/paperRoutes"),
  courses: require("./routes/CourseRoutes"),
  subjects: require("./routes/subjectRoutes"),
  units: require("./routes/unitRoutes"),
  questionsIsaac: require("./routes/questionRoutes_Isaac"),
  randomization: require("./routes/randomizationRoutes"),
  endSemQuestions: require("./routes/EndSemQuestionRoutes")
};

// Route Handlers
Object.entries(routes).forEach(([name, route]) => {
  app.use(`/api/${name}`, route);
  console.log(`📍 Registered route: /api/${name}`);
});

// Error handling middleware
app.use(errorHandler);

// Production Frontend Serving
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Graceful Shutdown
const shutdown = () => {
  console.log('Received kill signal, shutting down gracefully');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});

module.exports = app;
