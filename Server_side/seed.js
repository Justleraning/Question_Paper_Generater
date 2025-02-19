const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Question = require("./models/Question");
const Paper = require("./models/Paper");
const Course = require("./models/Course"); // Added Course model

const users = require("./data/dummyUsers");
const questions = require("./data/dummyQuestions");
const papers = require("./data/dummyPapers");
const courses = require("./data/CourseData"); // Added Courses data

dotenv.config();
connectDB();

// Function to hash passwords before inserting users
const hashPasswords = async (users) => {
  return Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10), // Hash passwords
    }))
  );
};

const importData = async () => {
  try {
    console.log("🌍 Connecting to MongoDB...");
    
    // Delete existing data
    await User.deleteMany();
    await Question.deleteMany();
    await Paper.deleteMany();
    await Course.deleteMany(); // Delete existing courses

    console.log("🗑️ Existing data cleared.");

    // Insert Users with hashed passwords
    const hashedUsers = await hashPasswords(users);
    await User.insertMany(hashedUsers);
    console.log("✅ Users inserted with hashed passwords.");

    // Insert Questions
    await Question.insertMany(questions);
    console.log("✅ Questions inserted.");

    // Insert Papers
    await Paper.insertMany(papers);
    console.log("✅ Papers inserted.");

    // Insert Courses
    await Course.insertMany(courses);
    console.log("✅ Courses inserted.");

    console.log("🎉 All data imported successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

importData();
