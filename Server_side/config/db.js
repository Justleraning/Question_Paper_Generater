require("dotenv").config({ path: "./config.env" }); // Load environment variables
console.log("🔍 Loaded JWT_SECRET:", process.env.JWT_SECRET);

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // ✅ Use Only the module_1_5 Database
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/module_1_5";

    if (!mongoURI) {
      throw new Error("❌ MONGO_URI is not defined in the environment variables.");
    }

    // ✅ Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Using ${mongoURI})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
