// QuestionOptionsForm.js
import React from 'react';

const QuestionOptionsForm = ({ 
  options, 
  updateOption, 
  correctOption, 
  setCorrectOption, 
  hideImageOption = false // Default to false for backward compatibility
}) => {
  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-medium mb-2">Options</h3>
      
      {options.map((option, index) => (
        <div key={index} className="flex items-start mb-4">
          <div className="flex-shrink-0 mt-1">
            <input
              type="radio"
              name="correctOption"
              checked={correctOption === index + 1}
              onChange={() => setCorrectOption(index + 1)}
              className="mr-2"
            />
          </div>
          
          <div className="flex-grow ml-2">
            <div className="flex items-center">
              <span className="font-bold mr-2">{['A', 'B', 'C', 'D'][index]}.</span>
              
              {/* Always use Text input since we're hiding Image option */}
              <input
                type="text"
                value={option?.value || ''}
                onChange={(e) => updateOption(index, 'value', e.target.value)}
                placeholder={`Option ${['A', 'B', 'C', 'D'][index]}`}
                className="flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Image option toggle - only render if not hidden */}
              {!hideImageOption && (
                <select
                  value={option?.type || 'Text'}
                  onChange={(e) => updateOption(index, 'type', e.target.value)}
                  className="ml-2 p-2 border rounded"
                >
                  <option value="Text">Text</option>
                  <option value="Image">Image</option>
                </select>
              )}
            </div>
            
            {/* Image upload UI - only render if not hidden and type is Image */}
            {!hideImageOption && option?.type === 'Image' && (
              <div className="mt-2 p-2 border rounded bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Upload an image for this option:</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    // Handle image upload logic here
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        updateOption(index, 'value', event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm"
                />
              </div>
            )}
          </div>
        </div>
      ))}
      
    </div>
  );
};

export default QuestionOptionsForm;