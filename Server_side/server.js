require("dotenv").config();
console.log("🔍 Loaded JWT_SECRET:")
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler"); // Unified Error Handler

// ✅ Initialize Express App
const app = express();

// ✅ Connect to MongoDB BEFORE starting the server
connectDB()
  .then(() => console.log("✅ Database connected successfully!"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

// ✅ CORS Configuration (Allow Frontend Requests)
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// ✅ Log Incoming Requests
app.use((req, res, next) => {
    console.log(`🔍 Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ Import API Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const paperRoutes = require("./routes/paperRoutes");
const courseRoutes = require("./routes/CourseRoutes"); // ✅ Course Routes

// ✅ Additional Routes from Second Codebase
const subjectRoutes = require("./routes/subjectRoutes");
const unitRoutes = require("./routes/unitRoutes");
const questionRoutesIsaac = require("./routes/questionRoutes_Isaac");
const randomizationRoutes = require("./routes/randomizationRoutes");

// ✅ Ensure API routes are used AFTER DB connection
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes); // Existing Questions Route
app.use("/api/questions-isaac", questionRoutesIsaac); // ✅ Isaac's Question Route
app.use("/api/papers", paperRoutes); // Fixed route naming for consistency
app.use("/api/courses", courseRoutes); // ✅ Courses Route
app.use("/api/subjects", subjectRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/randomize", randomizationRoutes);

// ✅ Error handling middleware (Must be after routes)
app.use(errorHandler);

// ✅ Serve Frontend in Production Mode Only
if (process.env.NODE_ENV === "production") {
    console.log("🚀 Serving Frontend in Production Mode...");
    const frontendPath = path.join(__dirname, "../frontend/build");
    app.use(express.static(frontendPath));

    // ✅ Serve React `index.html` for any unknown route
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}

// ✅ Start Backend Server on Port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
