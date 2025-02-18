const express = require("express");
const Course = require("../models/Course");
const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Server error while fetching courses" });
  }
});

// Add a new course manually (for future use)
router.post("/", async (req, res) => {
  try {
    const { id, name, subjects } = req.body;
    const newCourse = new Course({ id, name, subjects });
    await newCourse.save();
    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ message: "Failed to add course" });
  }
});

module.exports = router;
