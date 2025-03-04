const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  text: String,
  marks: Number,
  unit: String,
  part: String,
});

module.exports = mongoose.model("Question_midsem", questionSchema);
