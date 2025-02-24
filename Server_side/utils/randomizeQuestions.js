const randomizeQuestions = (questions, totalMarks) => {
    if (!questions || questions.length === 0) {
      throw new Error("No questions provided for randomization.");
    }
  
    // Determine the number of questions required based on total marks
    const totalQuestions = totalMarks === 20 ? 20 : 30;
  
    if (questions.length < totalQuestions) {
      throw new Error("Not enough questions available to fulfill the requirement.");
    }
  
    // Shuffle the questions array
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  
    // Select the required number of questions
    const selectedQuestions = shuffledQuestions.slice(0, totalQuestions);
  
    return selectedQuestions;
  };
  
  module.exports = randomizeQuestions;
  