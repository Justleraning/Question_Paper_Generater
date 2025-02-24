import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { QPContext } from '../context/QPContext';

const PreviewPage = () => {
  const { numUnits, questions } = useContext(QPContext);
  const [currentUnit, setCurrentUnit] = useState(1);
  const navigate = useNavigate();

  const currentQuestions = questions[currentUnit - 1] || [];

  const handleEditQuestion = (index) => {
    navigate(`/edit-question/${currentUnit}/${index}`); // Replace with your route for editing questions
  };

  const handlePrevUnit = () => {
    if (currentUnit > 1) setCurrentUnit(currentUnit - 1);
  };

  const handleNextUnit = () => {
    if (currentUnit < numUnits) setCurrentUnit(currentUnit + 1);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Preview Questions</h1>
      <h2 className="text-lg font-medium mb-2">Unit {currentUnit} of {numUnits}</h2>

      {currentQuestions.length === 0 ? (
        <p className="text-gray-500 mb-4">No questions added for this unit yet.</p>
      ) : (
        <ul className="w-full max-w-2xl">
          {currentQuestions.map((question, index) => (
            <li key={index} className="border rounded-lg p-4 mb-4">
              <p className="font-medium mb-2">Q{index + 1}: {question.text}</p>
              <ul className="mb-2">
                {Object.entries(question.options).map(([key, value]) => (
                  <li key={key} className="flex items-center mb-1">
                    <span className="mr-2 font-bold">{key}:</span>
                    <span>{value}</span>
                    {question.correctOption === key && <span className="ml-2 text-green-500">(Correct)</span>}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleEditQuestion(index)}
                className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex space-x-4 mt-4">
        <button
          onClick={handlePrevUnit}
          disabled={currentUnit === 1}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Prev Unit
        </button>
        <button
          onClick={handleNextUnit}
          disabled={currentUnit === numUnits}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Next Unit
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;
