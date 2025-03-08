import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectParts.css";

function SelectParts() {
  const navigate = useNavigate();
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");

  const subjectOptions = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
  ];

  const handleSubjectChange = (e) => {
    const selectedCode = e.target.value;
    setSelectedSubjectCode(selectedCode);
    
    // Find the corresponding subject name
    const subject = subjectOptions.find(
      (subject) => subject.code === selectedCode
    );
    setSelectedSubjectName(subject ? subject.name : "");
  };

  const handlePartClick = (part) => {
    if (!selectedSubjectCode) {
      alert("Please select a subject first.");
      return;
    }
    
    // Extract just the letter from "Part X"
    const partLetter = part.replace("Part ", "");
    
    // Pass the selected subject code and part to the next page
    navigate(`/question-pool?subjectCode=${encodeURIComponent(selectedSubjectCode)}&part=${partLetter}`);
  };

  return (
    <div className="din2-main-container">
      {/* Subject Selection Container */}
      <div className="din2-container">
        <h1 className="din2-heading">Select Subject</h1>
        <p className="din2-description">Choose a subject to add questions:</p>
        <select
          className="din2-dropdown"
          onChange={handleSubjectChange}
          value={selectedSubjectCode}
        >
          <option value="" disabled selected>Select Subject Code</option>
          {subjectOptions.map((subject, index) => (
            <option key={index} value={subject.code}>
              {subject.code}
            </option>
          ))}
        </select>
        
        {/* Display selected subject name */}
        {selectedSubjectName && (
          <div className="din2-selected-subject">
            <p><span className="din2-subject-label">Selected Subject:</span> <span className="din2-subject-name">{selectedSubjectName}</span></p>
          </div>
        )}
      </div>

      {/* Part Selection Container */}
      <div className="din2-container">
        <h1 className="din2-heading">Create Questions</h1>
        <p className="din2-description">Select a part to add questions:</p>
        <button
          className="din2-action-btn"
          onClick={() => handlePartClick("Part A")}
        >
          Part A
        </button>
        <button
          className="din2-action-btn"
          onClick={() => handlePartClick("Part B")}
        >
          Part B
        </button>
        <button
          className="din2-action-btn"
          onClick={() => handlePartClick("Part C")}
        >
          Part C
        </button>
      </div>
    </div>
  );
}

export default SelectParts;