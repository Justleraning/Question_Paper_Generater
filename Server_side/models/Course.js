const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subjects: { type: [String], required: true }, // Array of subjects
});

module.exports = mongoose.model("Course", courseSchema);
