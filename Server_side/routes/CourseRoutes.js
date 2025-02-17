// backend/routes/courseRoutes.js
const express = require("express");
const courses = require("../data/CourseData");

const router = express.Router();

// ✅ API to Get All Courses with Custom Subjects
router.get("/", (req, res) => {
  res.json(courses);
});

module.exports = router;
