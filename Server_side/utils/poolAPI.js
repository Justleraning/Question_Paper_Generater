const Question = require("../models/Question");

const fetchQuestionsByCourse = async (course, limits) => {
  const subjects = ["Logical Reasoning", "Quantitative Aptitude", "English", "Custom"];
  const questionPool = {};

  for (const subject of subjects) {
    const questions = await Question.find({ course, subject }).limit(limits[subject]);
    questionPool[subject] = questions;
  }

  const insufficientSubjects = subjects.filter(
    (subject) => questionPool[subject].length < limits[subject]
  );

  return { questionPool, insufficientSubjects };
};

module.exports = fetchQuestionsByCourse;
