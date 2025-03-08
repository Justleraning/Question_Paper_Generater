const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

const User = require("./models/User");
const Question = require("./models/Question");
const Paper = require("./models/Paper");
const Course = require("./models/Course");
const EndQuestion = require("./models/EndQuestion");

const users = require("./data/dummyUsers");
const questions = require("./data/dummyQuestions");
const papers = require("./data/dummyPapers");
const courses = require("./data/CourseData");
const endquestion = require('./data/EndSemQuestionData');

dotenv.config();
connectDB();

// Function to hash passwords before inserting users
const hashPasswords = async (users) => {
  return Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10),
    }))
  );
};

// Function to prepare questions with questionId
const prepareQuestions = (questions) => {
  return questions.map((question, index) => ({
    ...question,
    questionId: `q${index + 1}`, // Fixed template literal syntax
    correctOption: typeof question.correctOption === 'string' 
      ? question.options.findIndex(opt => opt.value === question.correctOption) 
      : question.correctOption, 
  }));
};

const importData = async () => {
  try {
    console.log("🌍 Connecting to MongoDB...");
    
    // Delete existing data
    await User.deleteMany();
    await Question.deleteMany();
    await Paper.deleteMany();
    await Course.deleteMany();
    await EndQuestion.deleteMany();

    console.log("🗑 Existing data cleared.");

    // Insert Users with hashed passwords
    const hashedUsers = await hashPasswords(users);
    await User.insertMany(hashedUsers);
    console.log("✅ Users inserted with hashed passwords.");

    // Prepare and insert Questions
    const preparedQuestions = prepareQuestions(questions);
    await Question.insertMany(preparedQuestions);
    console.log("✅ Questions inserted.");

    // Insert Papers
    await Paper.insertMany(papers);
    console.log("✅ Papers inserted.");

    // Insert Courses
    await Course.insertMany(courses);
    console.log("✅ Courses inserted.");

    // Insert End Sem Questions with error handling
    try {
      const insertedEndQuestions = await EndQuestion.insertMany(endquestion);
      console.log(`✅ End Sem Questions inserted. Total: ${insertedEndQuestions.length}`);
    } catch (endSemError) {
      console.error(`❌ Error inserting End Sem Questions: ${endSemError.message}`);
      if (endSemError.errors) {
        Object.keys(endSemError.errors).forEach(key => {
          console.error(`Validation Error for ${key}: ${endSemError.errors[key].message}`);
        });
      }
    }

    console.log("🎉 All data imported successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

importData();
