import React from 'react';

const SubjectNavigationControl = ({
  SUBJECTS,
  SUBJECT_NAMES,
  currentSubjectIndex,
  setCurrentSubjectIndex,
  showNextSubjectConfirm // Function to handle showing confirmation
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4">Subject Navigation</h2>
      
      {/* Next Subject Button */}
      {currentSubjectIndex < SUBJECTS.length - 1 && (
        <button 
          className="bg-purple-600 text-white py-2 px-4 rounded mb-4 hover:bg-purple-700" 
          onClick={showNextSubjectConfirm}
        >
          Next Subject
        </button>
      )}
      
      <div className="space-y-2">
        {SUBJECTS.map((subject, index) => (
          <div
            key={subject}
            className={`p-3 border rounded flex justify-between items-center ${
              index === currentSubjectIndex 
                ? 'bg-purple-100 border-purple-500' 
                : 'bg-gray-50'
            } ${
              index > currentSubjectIndex ? 'opacity-60' : 'opacity-100'
            }`}
            onClick={() => {
              if (index < currentSubjectIndex) {
                // Don't allow going back
                return;
              }
              if (index > currentSubjectIndex) {
                // Show confirmation before proceeding to next subject
                showNextSubjectConfirm();
              }
            }}
          >
            <span>{SUBJECT_NAMES[subject]}</span>
            <span className="text-sm">
              {index < currentSubjectIndex ? '✓ Completed' :
                index === currentSubjectIndex ? 'Current' : 'Locked'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectNavigationControl;
