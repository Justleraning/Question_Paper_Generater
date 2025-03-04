import React from 'react';

// Component for editing question options
const QuestionOptionsForm = ({ 
  options, 
  updateOption, 
  correctOption, 
  setCorrectOption 
}) => {
  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold mb-3">Answer Options</h3>
      
      {options.map((option, index) => (
        <div key={index} className="mb-4 p-4 border rounded">
          <div className="flex items-center mb-2">
            <div className="mr-4">
              <input
                type="radio"
                id={`option-${index+1}`}
                name="correctOption"
                checked={correctOption === index+1}
                onChange={() => setCorrectOption(index+1)}
                className="mr-2"
              />
              <label htmlFor={`option-${index+1}`} className="text-sm font-medium">
                {String.fromCharCode(65 + index)}. {correctOption === index+1 ? "(Correct Answer)" : ""}
              </label>
            </div>
            
            <div className="flex-grow">
              <select
                value={option.type || "Text"}
                onChange={(e) => updateOption(index, "type", e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="Text">Text</option>
                <option value="Image">Image</option>
              </select>
            </div>
          </div>
          
          {option.type === "Text" ? (
            <textarea
              value={option.value || ""}
              onChange={(e) => updateOption(index, "value", e.target.value)}
              placeholder={`Enter option ${String.fromCharCode(65 + index)} text`}
              className="w-full px-3 py-2 border rounded"
              rows="2"
            />
          ) : (
            <div className="flex flex-col items-center">
              {option.value ? (
                <div className="w-full">
                  <img 
                    src={option.value} 
                    alt={`Option ${String.fromCharCode(65 + index)}`} 
                    className="max-h-40 mb-2 mx-auto object-contain"
                  />
                  <p className="text-sm text-center text-gray-500">{option.fileName || "Uploaded image"}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No image selected</p>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateOption(index, "file", e.target.files[0]);
                  }
                }}
                className="mt-2"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionOptionsForm;