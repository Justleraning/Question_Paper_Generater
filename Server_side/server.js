const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const paperRoutes = require("./routes/paperRoutes");
const courseRoutes = require("./routes/CourseRoutes"); // ✅ Course Routes

const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Log Incoming Requests
app.use((req, res, next) => {
  console.log(`🔍 Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/papers", paperRoutes); // Fixed route naming for consistency
app.use("/api/courses", courseRoutes); // ✅ Courses Route

// ✅ Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
