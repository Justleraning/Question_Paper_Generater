import React from 'react';

// Component to display progress for all subjects
const SubjectProgressDisplay = ({ 
  SUBJECTS, 
  SUBJECT_NAMES, 
  currentSubjectIndex, 
  subjectProgress, 
  currentQuestionIndex, 
  TOTAL_QUESTIONS,
  isCurrentSubjectComplete,
  questionCounts // New prop to receive variable question counts
}) => {
  return (
    <div className="w-full bg-gray-100 rounded-lg p-4 mb-6">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Subject Progress</h3>
      </div>
      
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {SUBJECTS.map((subject, index) => {
          const isActive = index === currentSubjectIndex;
          const subjectQuestionCount = questionCounts ? questionCounts[subject] : TOTAL_QUESTIONS;
          const completedQuestions = Object.keys(subjectProgress[subject]?.questions || {}).length;
          const percentage = Math.round((completedQuestions / subjectQuestionCount) * 100);
          
          return (
            <div 
              key={subject}
              className={`border rounded p-3 ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
              <h4 className="font-medium text-sm">{SUBJECT_NAMES[subject]}</h4>
              
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              <div className="mt-1 text-xs text-gray-600 flex justify-between">
                <span>{completedQuestions} of {subjectQuestionCount}</span>
                <span>{percentage}%</span>
              </div>
              
              {isActive && (
                <div className="mt-2 text-xs text-blue-600">
                  Current Question: {currentQuestionIndex} / {subjectQuestionCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectProgressDisplay;