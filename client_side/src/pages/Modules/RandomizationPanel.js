import React, { useState, useEffect } from 'react';

const SimplifiedRandomizationPanel = ({ subjects, totalMarks, onRandomize }) => {
  // Fixed total marks - always 40, 1 mark per question
  const FIXED_TOTAL_MARKS = 40;
  const MARKS_PER_QUESTION = 1;
  
  // State for selected subjects and options
  const [selectedSubjects, setSelectedSubjects] = useState(
    subjects.reduce((acc, subject) => {
      acc[subject.code] = true;
      return acc;
    }, {})
  );
  const [maxQuestions, setMaxQuestions] = useState(10);
  
  // Update selected subjects when subjects prop changes
  useEffect(() => {
    setSelectedSubjects(
      subjects.reduce((acc, subject) => {
        acc[subject.code] = selectedSubjects[subject.code] !== undefined 
          ? selectedSubjects[subject.code] 
          : true;
        return acc;
      }, {})
    );
  }, [subjects]);
  
  // Handle subject checkbox change
  const handleSubjectChange = (code) => {
    const newSelectedSubjects = {
      ...selectedSubjects,
      [code]: !selectedSubjects[code]
    };
    
    setSelectedSubjects(newSelectedSubjects);
    
    // Immediately update the final preview when a subject is checked/unchecked
    const subjectCodes = Object.entries(newSelectedSubjects)
      .filter(([_, selected]) => selected)
      .map(([code]) => code);
    
    // Calculate the new questions count
    const newTotalQuestionsSelected = subjects
      .filter(subject => newSelectedSubjects[subject.code])
      .reduce((sum, subject) => sum + subject.count, 0);
    
    const maxQuestionsToDisplay = Math.min(maxQuestions, newTotalQuestionsSelected);
    
    // Only trigger the update if we have at least one subject selected
    if (subjectCodes.length > 0) {
      onRandomize({
        subjectCodes,
        totalMarksValue: FIXED_TOTAL_MARKS,
        maxQuestionsToDisplay,
        limitQuestions: true,
        updateSubjectsOnly: true
      });
    }
  };
  
  // Handle max questions change
  const handleMaxQuestionsChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= FIXED_TOTAL_MARKS) {
      setMaxQuestions(value);
    }
  };
  
  // Handle generate button click
  const handleGenerate = () => {
    // Get selected subject codes
    const subjectCodes = Object.entries(selectedSubjects)
      .filter(([_, selected]) => selected)
      .map(([code]) => code);
    
    // Check if any subjects are selected
    if (subjectCodes.length === 0) {
      alert("Please select at least one subject for the paper");
      return;
    }
    
    // Get maximum questions to display (using the user-selected maxQuestions value)
    const maxQuestionsToDisplay = Math.min(maxQuestions, totalQuestionsSelected);
    
    // Call parent's onRandomize function
    onRandomize({
      subjectCodes,
      totalMarksValue: FIXED_TOTAL_MARKS,
      maxQuestionsToDisplay,
      limitQuestions: true
    });
  };
  
  // Calculate total questions selected
  const totalQuestionsSelected = subjects
    .filter(subject => selectedSubjects[subject.code])
    .reduce((sum, subject) => sum + subject.count, 0);
  
  return (
    <div className="bg-white border border-gray-300 p-5 rounded-lg mb-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Select Questions for Final Paper</h2>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Select Subjects:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {subjects.map(subject => (
            <label key={subject.code} className="flex items-center p-3 border rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedSubjects[subject.code] || false}
                onChange={() => handleSubjectChange(subject.code)}
                className="mr-2"
              />
              <div>
                <span className="font-medium">{subject.name}</span>
                <span className="ml-2 text-sm text-gray-600">({subject.count} questions)</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Total Marks:</label>
          <div className="w-24 px-3 py-2 border rounded bg-gray-100 text-gray-700">
            {FIXED_TOTAL_MARKS}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Max Questions:</label>
          <input
            type="number"
            min="1"
            max={FIXED_TOTAL_MARKS}
            value={maxQuestions}
            onChange={handleMaxQuestionsChange}
            className="w-24 px-3 py-2 border rounded"
          />
        </div>
        
        <div className="flex-1 px-4">
          <div className="h-10 flex flex-col justify-center">
            <div className="flex items-center">
              <span className="font-medium">{totalQuestionsSelected} questions selected</span>
              
              {totalQuestionsSelected > maxQuestions && (
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  Will select {maxQuestions} random questions
                </span>
              )}
              
              {totalQuestionsSelected > 0 && totalQuestionsSelected <= maxQuestions && (
                <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  All {totalQuestionsSelected} questions will be used
                </span>
              )}
            </div>
            
            {totalQuestionsSelected > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Each question is worth {MARKS_PER_QUESTION} mark(s)
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={totalQuestionsSelected === 0}
          className={`px-4 py-2 rounded text-white ${
            totalQuestionsSelected === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          Generate Final Paper
        </button>
      </div>
      
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="font-medium mb-1">How selection works:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The system will select up to {maxQuestions} questions from your selected subjects</li>
          <li>If you've entered more than {maxQuestions} questions, a random subset will be selected</li>
          <li>Questions will be distributed evenly across all selected subjects</li>
          <li>Each question is worth exactly {MARKS_PER_QUESTION} mark</li>
          <li>Total marks will be {Math.min(maxQuestions, totalQuestionsSelected) * MARKS_PER_QUESTION}</li>
        </ul>
      </div>
    </div>
  );
};

export default SimplifiedRandomizationPanel;