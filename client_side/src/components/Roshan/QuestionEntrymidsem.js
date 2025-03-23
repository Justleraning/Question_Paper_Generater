import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const QuestionEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSubject = "N/A", semester = "N/A", selectedUnits = [], questions = {} } = location.state || {}; 

  // Initialize state to always ensure at least one question per unit
  const [questionData, setQuestionData] = useState(() => {
    const initialData = {};
    selectedUnits.forEach(unit => {
      initialData[unit] = questions[unit] && questions[unit].length > 0 
        ? questions[unit] 
        : [{ text: "", marks: "2", image: null }];
    });
    return initialData;
  });

  const handleQuestionChange = (unit, index, newText) => {
    setQuestionData((prev) => ({
      ...prev,
      [unit]: prev[unit].map((q, i) => i === index ? { ...q, text: newText } : q),
    }));
  };

  const handleMarksChange = (unit, index, value) => {
    setQuestionData((prev) => ({
      ...prev,
      [unit]: prev[unit].map((q, i) => i === index ? { ...q, marks: value } : q),
    }));
  };

  const handleImageChange = (unit, index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestionData((prev) => ({
          ...prev,
          [unit]: prev[unit].map((q, i) => i === index ? { ...q, image: e.target.result } : q),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuestion = (unit) => {
    setQuestionData((prev) => ({
      ...prev,
      [unit]: [...prev[unit], { text: "", marks: "2", image: null }],
    }));
  };

  // Delete question handler
  const deleteQuestion = (unit, index) => {
    setQuestionData((prev) => {
      // Make a copy of the questions for this unit
      const unitQuestions = [...prev[unit]];
      
      // If there's only one question, just clear it instead of removing it
      if (unitQuestions.length === 1) {
        return {
          ...prev,
          [unit]: [{ text: "", marks: "2", image: null }]
        };
      }
      
      // Otherwise remove the question at the specified index
      unitQuestions.splice(index, 1);
      
      return {
        ...prev,
        [unit]: unitQuestions
      };
    });
  };

  const [validationError, setValidationError] = useState("");

  const handleReview = () => {
    // Check if any questions have been entered
    let hasValidQuestions = false;
    
    // Check each unit for questions with text
    for (const unit in questionData) {
      const unitHasValidQuestion = questionData[unit].some(q => q.text.trim() !== "");
      if (unitHasValidQuestion) {
        hasValidQuestions = true;
        break;
      }
    }

    if (!hasValidQuestions) {
      setValidationError("Please enter at least one question before proceeding.");
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clear any previous error
    setValidationError("");
    
    const formattedQuestions = Object.entries(questionData).map(([unit, qns]) => ({
      unit,
      questions: qns.map((q) => ({
        text: q.text,
        marks: q.marks,
        image: q.image || null,
      })),
    }));

    navigate("/previewpagemidsem", { 
      state: { formattedQuestions, selectedSubject, semester, selectedUnits } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center">{`BCA - ${semester}`}</h2>
          <h3 className="text-xl text-gray-700 text-center mt-1">{selectedSubject}</h3>
        </div>

        {/* Main Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Add Questions</h2>
          <h4 className="text-gray-600 mt-2">(Minimum 19-20 questions)</h4>
          
          {/* Validation Error Message */}
          {validationError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
              {validationError}
            </div>
          )}
        </div>

        {/* Question Units */}
        {selectedUnits.map((unit) => (
          <div key={unit} className="bg-white rounded-lg shadow-md p-6 mb-8 mx-auto max-w-3xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              Unit {unit}
            </h3>

            {/* Question Items */}
            {questionData[unit]?.length > 0 ? (
              questionData[unit].map((q, index) => (
                <div key={index} className="mb-8 pb-6 border-b border-gray-100 last:border-0">
                  {/* Question Text Area */}
                  <div className="mb-4">
                    <textarea
                      value={q.text}
                      onChange={(e) => handleQuestionChange(unit, index, e.target.value)}
                      className="w-full min-h-32 p-4 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y text-gray-700"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Marks Selection */}
                    <div className="flex items-center space-x-3">
                      <label className="font-medium text-gray-700">Marks:</label>
                      <select
                        value={q.marks}
                        onChange={(e) => handleMarksChange(unit, index, e.target.value)}
                        className="bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="2">2</option>
                        <option value="4">4</option>
                      </select>
                    </div>

                    {/* Delete Question Button */}
                    <button
                      onClick={() => deleteQuestion(unit, index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete question"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Image Upload for 4 Marks Questions */}
                  {q.marks === "4" && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-dashed border-gray-300">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attach an image (optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(unit, index, e.target.files[0])}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {q.image && (
                        <div className="mt-3">
                          <img
                            src={q.image}
                            alt="Uploaded"
                            className="h-40 w-auto object-contain border border-gray-200 rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="mb-6">
                <textarea
                  onChange={(e) => handleQuestionChange(unit, 0, e.target.value)}
                  className="w-full min-h-32 p-4 bg-gray-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
                  placeholder="Enter your question here..."
                />
              </div>
            )}

            {/* Add Question Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => addQuestion(unit)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                title="Add question"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Footer Actions */}
        <div className="flex justify-center mt-8 mb-12">
          <button
            onClick={handleReview}
            className="group relative flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <span>Confirm & Preview</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEntry;