import React from 'react';

// Modal to confirm moving to the next subject
const NextSubjectConfirmModal = ({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  currentSubjectName,
  nextSubjectName,
  completedQuestions,
  totalQuestions
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="text-lg font-bold mb-4">Confirm Subject Change</div>
        <div className="mb-6">
          <p className="mb-2">
            You've completed <strong>{completedQuestions}</strong> out of <strong>{totalQuestions}</strong> questions 
            for <strong>{currentSubjectName}</strong>.
          </p>
          <p className="mb-4">
            Are you sure you want to move to <strong>{nextSubjectName}</strong>?
          </p>
          <p className="text-red-600 font-semibold">
            Warning: You will not be able to come back to {currentSubjectName} after this.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Move to Next Subject
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextSubjectConfirmModal;