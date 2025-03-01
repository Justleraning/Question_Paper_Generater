import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectParts.css";

function SelectParts() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedPart, setSelectedPart] = useState("");

  const subjectOptions = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
  ];

  const handleSubjectChange = (e) => {
    const selectedCode = e.target.value;
    const selectedSubject = subjectOptions.find(
      (subject) => subject.code === selectedCode
    );
    setSelectedSubject(selectedSubject ? selectedSubject.name : "");
  };

  const handlePartClick = (part) => {
    if (!selectedSubject) {
      alert("Please select a subject first.");
      return;
    }
    setSelectedPart(part);
    
    // Example navigation logic
    navigate("/question-pool");
  };

  return (
    <div className="din2-main-container">
      {/* Subject Selection Container */}
      <div className="din2-container">
        <h1 className="din2-heading">Select Subject</h1>
        <p className="din2-description">Choose a subject to add questions:</p>
        <input
          list="subjectList"
          className="din2-dropdown"
          placeholder="Type or select a subject"
          onChange={handleSubjectChange}
        />
        <datalist id="subjectList">
          {subjectOptions.map((subject, index) => (
            <option key={index} value={subject.code}>
              {subject.code} - {subject.name}
            </option>
          ))}
        </datalist>
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