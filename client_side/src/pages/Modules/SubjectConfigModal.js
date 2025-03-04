import React, { useState, useEffect } from 'react';

// Minimum required questions per subject
const MIN_QUESTIONS_PER_SUBJECT = 7;

const SubjectConfigModal = ({ 
  SUBJECTS, 
  SUBJECT_NAMES, 
  questionCounts, 
  setQuestionCounts, 
  onSubmit 
}) => {
  // Local state for question counts with validation
  const [localCounts, setLocalCounts] = useState(questionCounts);
  const [totalMarks, setTotalMarks] = useState(50);
  const [marksPerQuestion, setMarksPerQuestion] = useState({
    LR: 1,
    QP: 1,
    ENG: 1,
    CUSTOM: 1
  });
  const [errors, setErrors] = useState({});
  const [reservePercentage, setReservePercentage] = useState(20); // Default 20% reserve

  // Initialize with the external state
  useEffect(() => {
    setLocalCounts(questionCounts);
  }, [questionCounts]);

  // Calculate total questions and marks
  const totalQuestions = Object.values(localCounts).reduce((sum, count) => sum + count, 0);
  const activeQuestionsAfterReserve = Math.floor(totalQuestions * (1 - reservePercentage / 100));
  
  // Calculate calculated marks (what will actually appear in the paper)
  const calculatedMarks = Object.keys(marksPerQuestion).reduce((sum, subject) => {
    // Calculate how many questions will be used from this subject after reserve
    const subjectCount = localCounts[subject] || 0;
    const effectiveCount = Math.floor(subjectCount * (1 - reservePercentage / 100));
    return sum + (effectiveCount * marksPerQuestion[subject]);
  }, 0);

  // Handle question count change for a subject
  const handleQuestionCountChange = (subject, inputValue) => {
    const parsedCount = parseInt(inputValue);
    
    // Clear errors for this subject
    const newErrors = { ...errors };
    delete newErrors[subject];
    
    // Validate minimum question count
    if (!isNaN(parsedCount)) {
      if (parsedCount < MIN_QUESTIONS_PER_SUBJECT) {
        newErrors[subject] = `Minimum ${MIN_QUESTIONS_PER_SUBJECT} questions required`;
      }
      
      setErrors(newErrors);
      
      setLocalCounts({
        ...localCounts,
        [subject]: parsedCount
      });
    }
  };

  // Handle marks per question change
  const handleMarksPerQuestionChange = (subject, inputValue) => {
    const parsedMarks = parseInt(inputValue);
    if (!isNaN(parsedMarks) && parsedMarks > 0) {
      setMarksPerQuestion({
        ...marksPerQuestion,
        [subject]: parsedMarks
      });
    }
  };

  // Handle reserve percentage change
  const handleReserveChange = (value) => {
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 50) {
      setReservePercentage(parsed);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for any errors
    const hasErrors = Object.keys(errors).length > 0;
    const belowMinimum = Object.keys(localCounts).some(
      subject => (localCounts[subject] || 0) < MIN_QUESTIONS_PER_SUBJECT
    );
    
    if (hasErrors || belowMinimum) {
      // Update errors for subjects below minimum
      const newErrors = { ...errors };
      Object.keys(localCounts).forEach(subject => {
        if ((localCounts[subject] || 0) < MIN_QUESTIONS_PER_SUBJECT) {
          newErrors[subject] = `Minimum ${MIN_QUESTIONS_PER_SUBJECT} questions required`;
        }
      });
      
      setErrors(newErrors);
      return;
    }
    
    // Pass the validated counts and marks configuration to parent
    onSubmit(localCounts, marksPerQuestion, totalMarks, reservePercentage);
  };

  return (
    <div className="subject-config-overlay">
      <div className="subject-config-modal">
        <h2 className="text-xl font-bold mb-4">Configure Question Counts</h2>
        <p className="mb-4">Please specify how many questions you want for each subject:</p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {SUBJECTS.map((subject) => (
              <div key={subject} className="mb-4">
                <label className="block font-medium mb-1">
                  {SUBJECT_NAMES[subject] || subject}:
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600">Questions (min {MIN_QUESTIONS_PER_SUBJECT}):</label>
                    <input
                      type="number"
                      min={MIN_QUESTIONS_PER_SUBJECT}
                      value={localCounts[subject] || ""}
                      onChange={(e) => handleQuestionCountChange(subject, e.target.value)}
                      className={`w-full px-3 py-2 border rounded ${
                        errors[subject] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors[subject] && (
                      <p className="text-red-500 text-xs mt-1">{errors[subject]}</p>
                    )}
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-gray-600">Marks each:</label>
                    <input
                      type="number"
                      min="1"
                      value={marksPerQuestion[subject] || 1}
                      onChange={(e) => handleMarksPerQuestionChange(subject, e.target.value)}
                      className="w-full px-3 py-2 border rounded border-gray-300"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2">Reserve Questions Configuration</h3>
            <div className="flex items-center space-x-2">
              <label>Reserve percentage:</label>
              <input
                type="range"
                min="0"
                max="50"
                value={reservePercentage}
                onChange={(e) => handleReserveChange(e.target.value)}
                className="w-32"
              />
              <span>{reservePercentage}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.ceil(totalQuestions * (reservePercentage / 100))} questions will be reserved for randomization.
            </p>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-2">Paper Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>Total Questions: {totalQuestions}</p>
                <p>Questions in Paper: {activeQuestionsAfterReserve}</p>
                <p>Reserved: {totalQuestions - activeQuestionsAfterReserve}</p>
              </div>
              <div>
                <p>Calculated Marks: {calculatedMarks}</p>
                <div className="flex items-center mt-1">
                  <label className="mr-2">Target Total Marks:</label>
                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(parseInt(e.target.value) || 50)}
                    className="w-16 px-2 py-1 border rounded text-center"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700"
              disabled={Object.keys(errors).length > 0}
            >
              Start Creating Questions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectConfigModal;