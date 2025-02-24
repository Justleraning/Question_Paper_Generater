const randomizeQuestions = (questions, totalQuestions) => {
  if (!Array.isArray(questions) || questions.length === 0) return [];

  // Flatten questions from all units into one array
  const allQuestions = questions.flat();

  // Shuffle all questions
  const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

  // Select the required number of questions
  const selectedQuestions = shuffledQuestions.slice(0, totalQuestions);

  // Function to shuffle options while keeping track of the correct answer
  const shuffleOptions = (question) => {
    const optionEntries = Object.entries(question.options);
    const shuffledOptions = optionEntries.sort(() => Math.random() - 0.5);

    let correctAnswerKey = "";
    const newOptions = {};
    shuffledOptions.forEach(([key, value], index) => {
      const newKey = String.fromCharCode(65 + index); // Convert index to A, B, C, D
      newOptions[newKey] = value;
      if (key === question.correctAnswer) {
        correctAnswerKey = newKey; // Update correct answer key after shuffling
      }
    });

    return { ...question, options: newOptions, correctAnswer: correctAnswerKey };
  };

  return selectedQuestions.map(shuffleOptions);
};

export default randomizeQuestions;
