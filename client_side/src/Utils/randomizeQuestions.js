const randomizeQuestions = (questions, totalQuestions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    console.error("Invalid questions array:", questions);
    return [];
  }

  console.log("Starting randomization with", questions.length, "questions");
  console.log("Sample question format:", questions[0]);

  // Create a deep copy to avoid modifying the original array
  const allQuestions = [...questions];

  // Shuffle all questions
  const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

  // Select the required number of questions
  const selectedQuestions = shuffledQuestions.slice(0, 
    Math.min(totalQuestions, shuffledQuestions.length));
  
  console.log("Selected", selectedQuestions.length, "questions");

  // Check if options are in object format with keys or array format
  const processQuestion = (question) => {
    const q = {...question};
    
    // Handle both array and object options
    if (Array.isArray(q.options)) {
      // If options are in array format, shuffle them
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      
      // Find the index of correct option in shuffled array
      const correctOptionText = q.correctOption;
      const correctIndex = shuffledOptions.findIndex(option => 
        option === correctOptionText);
      
      if (correctIndex !== -1) {
        // Update the correctOption to reference the new position
        q.correctOption = shuffledOptions[correctIndex];
      }
      
      q.options = shuffledOptions;
    } else if (typeof q.options === 'object' && q.options !== null) {
      // If options are in object format with keys like A, B, C, D
      const optionEntries = Object.entries(q.options);
      const shuffledEntries = [...optionEntries].sort(() => Math.random() - 0.5);
      
      // Find which entry contains the correct answer text
      const correctOptionText = q.correctOption;
      const correctEntry = optionEntries.find(([_, value]) => 
        value === correctOptionText);
      
      // Create new options object with shuffled entries
      const newOptions = {};
      shuffledEntries.forEach(([_, value], index) => {
        const newKey = String.fromCharCode(65 + index); // A, B, C, D...
        newOptions[newKey] = value;
        
        // If this is the correct option, update correctOption
        if (value === correctOptionText) {
          q.correctOption = value;
        }
      });
      
      q.options = newOptions;
    }
    
    return q;
  };

  return selectedQuestions.map(processQuestion);
};

export default randomizeQuestions;