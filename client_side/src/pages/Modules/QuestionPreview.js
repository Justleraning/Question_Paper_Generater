import React from 'react';

const QuestionPreviewModal = ({ isOpen, onClose, subjectName, questions, onEditQuestion, showOptions = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg overflow-hidden shadow-xl flex flex-col">
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold">Preview - {subjectName}</h2>
          <button 
            onClick={onClose}
            className="bg-transparent text-white hover:bg-blue-700 rounded-full p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          {questions.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No questions found for this subject.
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={index} className="mb-6 p-4 border rounded shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">Question {question.index}</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEditQuestion(question, 'edit')}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onEditQuestion(question, 'delete')}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div 
                  className="mb-3 p-2 bg-gray-50 rounded"
                  dangerouslySetInnerHTML={{ __html: question.text }}
                />
                
                {/* Display options when showOptions is true */}
                {showOptions && question.options && question.options.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Options:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options
                        .filter(opt => opt && opt.value)
                        .map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={`p-2 border rounded ${
                              question.correctOption === optIndex ? 'bg-green-100 border-green-500' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <span className="font-bold mr-2">{String.fromCharCode(97 + optIndex)}.</span>
                              {option.type === "Image" ? (
                                <img src={option.value} alt={`Option ${String.fromCharCode(97 + optIndex)}`} className="max-h-32" />
                              ) : (
                                <span>{option.value}</span>
                              )}
                            </div>
                            {question.correctOption === optIndex && (
                              <div className="text-green-600 text-sm mt-1 font-medium">✓ Correct Answer</div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="bg-gray-100 px-4 py-3 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPreviewModal;