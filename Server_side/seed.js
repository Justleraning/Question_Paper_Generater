const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Question = require("./models/Question");
const Paper = require("./models/Paper");
const users = require("./data/dummyUsers");
const questions = require("./data/dummyQuestions");
const papers = require("./data/dummyPapers");

dotenv.config();
const connectDB = require("./config/db");

connectDB();

// Function to hash passwords before inserting users
const hashPasswords = async (users) => {
  return Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10), //  Hash the password
    }))
  );
};

const importData = async () => {
  try {
    await User.deleteMany();
    await Question.deleteMany();
    await Paper.deleteMany();

    //  Hash passwords before inserting users
    const hashedUsers = await hashPasswords(users);

    await User.insertMany(hashedUsers);
    await Question.insertMany(questions);
    await Paper.insertMany(papers);

    console.log(" Data Imported Successfully with Hashed Passwords!");
    process.exit();
  } catch (error) {
    console.error(` Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
