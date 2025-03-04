import React from 'react';

const NavigationButtons = (props) => {
  const {
    currentQuestionIndex,
    handlePrevQuestion,
    handleNextQuestion,
    handlePreviewSubject,
    handleShowFinalPreviewConfirm,
    showNextSubjectConfirm,
    isCurrentSubjectComplete,
    areAllSubjectsComplete,
    currentSubjectIndex,
    SUBJECTS,
    hasAnyQuestions
  } = props;

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-6">
      {/* Previous Question Button */}
      <button
        onClick={handlePrevQuestion}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
        disabled={currentQuestionIndex <= 1}
      >
        Previous Question
      </button>

      {/* Next Question Button - Now saves automatically */}
      <button
        onClick={handleNextQuestion}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save & Next Question
      </button>

      {/* Next Subject Button - Show only if not on last subject */}
      {currentSubjectIndex < SUBJECTS.length - 1 && (
        <button
          onClick={showNextSubjectConfirm}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
          disabled={!isCurrentSubjectComplete()}
        >
          Save & Next Subject
        </button>
      )}

      {/* Preview Subject Button */}
      <button
        onClick={handlePreviewSubject}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400"
        disabled={!isCurrentSubjectComplete()}
      >
        Preview Subject
      </button>

      {/* Final Preview Button */}
      <button
        onClick={handleShowFinalPreviewConfirm}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
        disabled={!hasAnyQuestions()}
      >
        Final Preview
      </button>
    </div>
  );
};

export default NavigationButtons;