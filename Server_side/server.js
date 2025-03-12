require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet"); // Added for security
const compression = require("compression"); // Added for performance
const errorHandler = require("./middlewares/errorHandler");

// Initialize Express App
const app = express();

// Enhanced CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000", 
      "http://127.0.0.1:3000", 
      "https://your-production-domain.com" // Add your production domain
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Access-Control-Allow-Methods",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS first
app.use(helmet()); // Add security headers
app.use(compression()); // Compress responses

// Body parsing middleware
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

// Fallback OPTIONS handler
app.options('*', cors(corsOptions));

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
