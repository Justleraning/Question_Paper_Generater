import React, { useState } from "react";

const QuestionInput = ({ onSave, question = {} }) => {
  const [text, setText] = useState(question.text || "");
  const [options, setOptions] = useState(question.options || ["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(question.correctOption || "");

  const handleSave = () => {
    if (!text || options.some((opt) => !opt)) {
      alert("Please fill in all fields.");
      return;
    }
    onSave({ text, options, correctOption });
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter question text"
      />
      {options.map((option, index) => (
        <input
          key={index}
          value={option}
          onChange={(e) => {
            const updatedOptions = [...options];
            updatedOptions[index] = e.target.value;
            setOptions(updatedOptions);
          }}
          placeholder={`Option ${index + 1}`}
        />
      ))}
      <select
        value={correctOption}
        onChange={(e) => setCorrectOption(e.target.value)}
      >
        <option value="">Select Correct Option</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            Option {index + 1}
          </option>
        ))}
      </select>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default QuestionInput;
