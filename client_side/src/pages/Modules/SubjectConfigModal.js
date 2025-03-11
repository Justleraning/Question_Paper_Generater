import React from 'react';

// Simplified configuration modal that only shows paper type selection
const SimplifiedConfigModal = ({ markType, setMarkType, onSubmit }) => {
  // Handle mark type change
  const handleMarkTypeChange = (newValue) => {
    setMarkType(parseInt(newValue));
  };
  
  return (
    <div className="subject-config-overlay">
      <div className="subject-config-modal">
        <h2 className="text-xl font-bold mb-4">Configure Question Paper</h2>
        
        <div className="mb-6">
          <p className="font-medium mb-2">Select Paper Type:</p>
          <div className="flex flex-col gap-4">
            <label className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                value={40} 
                checked={markType === 40}
                onChange={(e) => handleMarkTypeChange(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">40 Marks Paper</div>
                <div className="text-sm text-gray-600">15 questions per subject</div>
              </div>
            </label>
            
            <label className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input 
                type="radio" 
                value={60} 
                checked={markType === 60}
                onChange={(e) => handleMarkTypeChange(e.target.value)}
                className="mr-3"
              />
              <div>
                <div className="font-medium">60 Marks Paper</div>
                <div className="text-sm text-gray-600">20 questions per subject</div>
              </div>
            </label>
          </div>
        </div>
        
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 mt-6"
        >
          Start Creating Questions
        </button>
      </div>
    </div>
  );
};

export default SimplifiedConfigModal;